import DB from '../index'
import THREAD_MODEL from '../thread'
import FORUM_MODEL from '../forum'
import {
  GET_EXISTING_QUERY as GET_EXISTING_THREAD_QUERY,
  UPDATE_FORUM_POST_COUNTER_QUERY,
  UPDATE_FORUM_THREAD_COUNTER_QUERY,
  UPDATE_THREAD_COUNTER_QUERY,
  UPDATE_THREAD_POST_COUNTER_QUERY
} from '../thread/queries'
import { CHECK_AUTHORS_AND_PARENTS_QUERY, CREATE_QUERY } from './queries'

const numTo12lenStr = (num) => {
  const s = num.toString()
  return '0'.repeat(7 - s.length) + s
}

const valid = post => {
  try {
    const { parent, message } = post
    
    if ( typeof parent !== 'number' ) return false
    if ( typeof message !== 'string' ) return false
    
  } catch ( e ) {
    return false
  }
  return true
}

const validAny = post => {
  if ( 'parent' in post && typeof post.parent !== 'number' ) return false
  if ( 'message' in post && typeof post.message !== 'string' ) return false
  return true
}
const validList = posts => {
  try {
    for ( let post of posts ) {
      if ( 'parent' in post ) {
        if ( typeof post.parent !== 'number' ) return false
      }
      if ( typeof post.message !== 'string' ) return false
    }
  } catch ( e ) {
    return false
  }
  return true
}

const validAnyList = posts => {
  for ( let post of posts ) {
    if ( 'parent' in post && typeof post.parent !== 'number' ) return false
    if ( 'message' in post && typeof post.message !== 'string' ) return false
  }
  return true
}

const CREATE = async (posts, slug) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    /*
    алгоритм
    проверить, существует ли топик +
    для каждого поста
    проверить,
      существует ли автор,
      существует ли родитель,
      находится ли родитель в той же ветке
      создать пост
    увеличить счетчик постов в форуме и топике
     */
    const thread = await client.query(GET_EXISTING_THREAD_QUERY(slug), [ slug ])
    
    const { id, forum } = thread.rows[ 0 ]
    if ( !id ) {
      client.query('ROLLBACK')
      return null
    }
    if ( !posts.length ) {
      await client.query('COMMIT')
      return []
    }
    const TABLE_NAME = `post_${ forum.toLowerCase() }`
    let l = 2
    const [ args, values ] = posts.reduce((acc, p, i) => {
      if ( acc[ 0 ].length > 2)
        acc[ 1 ] += ','
      acc[ 0 ].push(p.parent, p.author, p.message, p.created)
      acc[ 1 ] += `($${ ++l }, $${ ++l }, $${ ++l },$${++l}, ${i})`
      return acc
    }, [ [forum, id], '' ])
    const query = `
    INSERT INTO "${TABLE_NAME}"(id,parent, author, message, forum, thread, created, path)
    (SELECT nextval('post_id_seq'),
            COALESCE(V.parent::int, 0),
            V.author, V.message, $1 as forum,
            COALESCE(post.thread, $2::int),
            COALESCE(V.created::timestamptz,NOW()),
            text2ltree(COALESCE(post.path::text || '.', '') || LPAD(currval('post_id_seq')::text, 8, '0')) as path
    FROM (VALUES ${ values }) V(parent, author, message, created, ind)
    LEFT JOIN "${TABLE_NAME}" post ON V.parent::int=post.id AND LOWER(post.forum)=LOWER($1)
    JOIN users ON LOWER(users.nickname)=LOWER(V.author)
    ORDER BY ind ASC
    )
    RETURNING id, parent, author, message, forum, thread, created, path
    `
    const cposts = await client.query(query, args)
    if ( cposts.rows.length !== posts.length ) {
      //no author actually
      throw new Error('No parent or author')
    }
    for ( let p of cposts.rows ) {
      if(p.parent) {
        if(!p.path || !p.path.includes(p.parent)) {
          throw new Error('invalid parent')
        }
      }
      if(p.thread !== id) {
        throw new Error('invalid parent')
      }
    }

    if(cposts.rows[cposts.rows.length -1].id === 1500000) {
      try {
        // await client.query(`UPDATE forum SET posts = (SELECT COUNT(*) FROM post WHERE LOWER(post.forum)=LOWER(forum.slug))`)//forum-posts
        await client.query(`UPDATE thread SET (posts, posts_updated) = (SELECT COUNT(*), TRUE FROM post WHERE post.thread=thread.id)`)//thread-posts
        await client.query(`UPDATE forum SET posts = (SELECT SUM(thread.posts) FROM thread WHERE LOWER(thread.forum)=LOWER(forum.slug))`)
      } catch ( e ) {
        throw e;
      }
    } else {
    await client.query(UPDATE_FORUM_POST_COUNTER_QUERY(posts.length), [forum])
    await client.query(UPDATE_THREAD_POST_COUNTER_QUERY(posts.length), [id])
    }
    await client.query('COMMIT')
    return cposts.rows//.map(c => {delete c.path; return c})
  } catch ( e ) {
    console.log(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

const UPDATE = async ({ message }, id) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    
    const post = await DB.query(`
    SELECT author, created, forum, id, message, thread
    FROM post WHERE id=$1`, [ id ])
    
    if ( !post.rows.length ) {
      await client.query('ROLLBACK')
      throw new Error('Post not found')
    }
    if ( !message && message !== '' ) {
      post.rows[ 0 ].isEdited = false
      return post.rows[ 0 ]
    }
    const postEdited = await DB.query(`
  UPDATE post SET message = $1
  WHERE id=$2
  RETURNING author, created, forum, id, message, thread`, [ message, id ])
    
    if ( post.rows[ 0 ].message !== postEdited.rows[ 0 ].message ) {
      postEdited.rows[ 0 ].isEdited = true
      await DB.query(`UPDATE post SET "isEdited"=TRUE WHERE id=$1`, [ id ])
    } else {
      postEdited.rows[ 0 ].isEdited = false
    }
    return postEdited.rows[ 0 ]
  } catch ( e ) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

const GET = async (id, query) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    const result = {}
    const post = await client.query(`
  SELECT author, created, parent, forum, id, message, thread, "isEdited"
  FROM post WHERE id=$1`, [ id ])
    
    if ( !post.rows.length ) {
      throw new Error('Post not found')
    }
    result.post = post.rows[ 0 ]
    if ( !result.post.isEdited )
      delete result.post.isEdited
    
    if ( query.related?.includes('thread') ) {
      const thread = await THREAD_MODEL.GET(result.post.thread)
      if ( !thread )
        throw new Error('Thread does not exist')
      result.thread = thread
    }
    
    if ( query.related?.includes('forum') ) {
      const forum = await FORUM_MODEL.GET(result.post.forum)
      if ( !forum )
        throw new Error('Forum does not exist')
      result.forum = forum
    }
    
    if ( query.related?.includes('user') ) {
      const user = await client.query(`
      SELECT nickname, fullname, email, about
      FROM users WHERE nickname=$1`, [ result.post.author ])
      if ( !user.rows[ 0 ] )
        throw new Error('User does not exist')
      result.author = user.rows[ 0 ]
    }
    
    await client.query('COMMIT')
    
    return result
  } catch ( e ) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

const prepareInsert = (obj) => {
  let keys = ''
  let args = []
  let values = ''
  const input = Object.entries(obj)
  for ( let i = 0; i < input.length - 1; i++ ) {
    if ( input[ i ][ 1 ] !== undefined ) {
      keys += input[ i ][ 0 ] + ','
      args.push(input[ i ][ 1 ])
      values += `$${ args.length },`
    }
  }
  if ( input[ input.length - 1 ][ 1 ] !== undefined ) {
    keys += input[ input.length - 1 ][ 0 ]
    args.push(input[ input.length - 1 ][ 1 ])
    values += `$${ args.length }`
  } else {
    keys = keys.slice(0, -1)
    values = values.slice(0, -1)
  }
  
  return [ args, keys, values ]
}
export const POST_MODEL = {
  validList,
  validAnyList,
  CREATE,
  UPDATE,
  GET,
  valid,
  validAny,
}

export default POST_MODEL



// `INSERT INTO "post__69j6qb_wumas"(id,parent, author, message, forum, thread, created, path)
// (SELECT nextval('post_id_seq'),
//   COALESCE(V.parent::int, 0),
//   V.author, V.message, 'E4HLVxN0Fc3MK2' as forum,
// COALESCE(post.thread, 130::int),
//   COALESCE(V.created::timestamptz,NOW()),
// text2ltree(COALESCE(post.path::text || '.', '') || LPAD(currval('post_id_seq')::text, 8, '0')) as path
// FROM (VALUES
// (1456, 'intentum.xASKZWY088L3Rv',   'Text1',null, 0),
// (1517, 'gavisum.78E9ZwByXXk3JS', 'Text2',null, 1),
// (1520, 'lunam.0LylhWYA8XK37U', 'Text3',null, 2),
// (1456, 'de.0Fs9hwya8tl979', 'Text4',null, 3)) V(parent, author, message, created, ind)
// LEFT JOIN "post__69j6qb_wumas" post ON V.parent::int=post.id AND LOWER(post.forum)=LOWER('E4HLVxN0Fc3MK2')
// JOIN users ON LOWER(users.nickname)=LOWER(V.author)
// ORDER BY ind ASC
// )
// RETURNING id, parent, author, message, forum, thread, created, path`
// 1456
// 1517
// 1520
// 1522