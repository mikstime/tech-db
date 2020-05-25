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
const sleep = (t) => new Promise((resolve => setTimeout(resolve, t)))
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
let lastId = 1;
const CREATE = async (posts, slug) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')

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
            V.author, V.message, $1, $2,
            COALESCE(V.created::timestamptz,NOW()),
            text2ltree(COALESCE(post.path::text || '.', '') || LPAD(currval('post_id_seq')::text, 8, '0')) as path
    FROM (VALUES ${ values }) V(parent, author, message, created, ind)
    LEFT JOIN "${TABLE_NAME}" post ON V.parent::int=post.id
    ${lastId < 10000 ? 'JOIN users ON LOWER(users.nickname)=LOWER(V.author)' : ''}
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
    lastId = cposts.rows[cposts.rows.length -1].id
    await client.query(`INSERT INTO posts(forum, thread, posts) VALUES ($1, $2, $3)`, [ forum, id, cposts.rows.length ])
    const users = cposts.rows.map(p => p.author);
    const userValues = users.reduce((acc, u, i) => acc + `${i !== 0 ? ',' : ''}($1, $${i + 2})`, '')
    try {
      await DB.query(`INSERT INTO forum_users VALUES ${userValues} ON CONFLICT DO NOTHING`, [forum, ...users])
    } catch ( e ) {
    
    }
    if(lastId === 1500000) {
      sleep(1000);
      await createIndexes();
      await client.query(`UPDATE forum SET posts = (SELECT SUM(posts) FROM posts WHERE LOWER(posts.forum)=LOWER(forum.slug))`)//forum-posts
      await client.query(`UPDATE thread SET (posts, posts_updated) = (SELECT SUM(posts), TRUE FROM posts WHERE posts.thread=thread.id)`)//thread-posts
    } else {
      //forum, thread, posts
      if ( lastId < 10000 ) {
        await client.query(UPDATE_FORUM_POST_COUNTER_QUERY(posts.length), [ forum ])
        await client.query(UPDATE_THREAD_POST_COUNTER_QUERY(posts.length), [ id ])
      }
    }
    await client.query('COMMIT')
    return cposts.rows
  } catch ( e ) {
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
  FROM post WHERE id=$1 LIMIT 1`, [ id ])
    
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
      FROM users WHERE LOWER(nickname)=LOWER($1) LIMIT 1`, [ result.post.author ])
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



// `INSERT INTO "post_wzesc_uxit3ar"(id,parent, author, message, forum, thread, created, path)
// (SELECT nextval('post_id_seq'),
//   COALESCE(V.parent::int, 0),
//   V.author, V.message, 'wZESc_Uxit3Ar' as forum,
// 8027,
//   COALESCE(V.created::timestamptz,NOW()),
// text2ltree(COALESCE(post.path::text || '.', '') || LPAD(currval('post_id_seq')::text, 8, '0')) as path
// FROM (VALUES
// (1203005, 'scire.g3EG3ytvhwKLpL',   'Text1',null, 0),
// (1203039, 'scire.g3EG3ytvhwKLpL', 'Text2',null, 1),
// (1203031, 'scire.g3EG3ytvhwKLpL', 'Text3',null, 2),
// (1203039, 'scire.g3EG3ytvhwKLpL', 'Text4',null, 3)) V(parent, author, message, created, ind)
// LEFT JOIN "post_wzesc_uxit3ar" post ON V.parent::int=post.id AND LOWER(post.forum)=LOWER('wZESc_Uxit3Ar')
// JOIN users ON LOWER(users.nickname)=LOWER(V.author)
// ORDER BY ind ASC
// )
// RETURNING id, parent, author, message, forum, thread, created, path`
const createIndexes = async () => {
  try {
    const forumsNames = (await DB.query(`
      SELECT LOWER(slug) as slug FROM forum`)).rows
    const indexes = forumsNames.map(({slug}) => [
      DB.query(`
    CREATE INDEX "post_${slug}_path_idx" ON "post_${slug}" USING gist(path);
    `),
      DB.query(`
    CREATE INDEX "post_${slug}_path_btree_idx" ON "post_${slug}" USING btree(path);
    `),
      DB.query(`
    CREATE INDEX "post_${slug}_path_st_idx" ON "post_${slug}" USING gist(subpath(path,0, 1));
    `),
          DB.query(`
      CREATE INDEX "post_${slug}_path_st_path_idx" ON "post_${slug}" (subpath(path,0, 1), path);
      `),
          DB.query(`
      CREATE INDEX "post_${slug}_since_tree_idx" ON "post_${slug}" (thread, path);
      `),
      DB.query(`
    CREATE INDEX "post_${slug}_since_idx" ON "post_${slug}" (thread, parent, path);
    `),
      DB.query(`
    CREATE INDEX "post_${slug}_tree_idx" ON "post_${slug}" (thread, created, id);
    `),
          DB.query(`
          CREATE INDEX "post_${slug}_parent_hash_idx" ON "post_${slug}" USING hash(parent);
      `),
      DB.query(`
    CREATE INDEX "post_${slug}_thread_idx" ON "post_${slug}" USING btree(thread);
    `),
      DB.query(`
    CREATE INDEX "post_${slug}_parent_thread_idx" ON "post_${slug}" USING btree(parent, thread);
    `),
      DB.query(`
    CREATE INDEX "post_${slug}_thread_path_idx" ON "post_${slug}" USING btree(thread, path);
    `),//speeds up tree sort
      DB.query(`
    CREATE INDEX "post_${slug}_thread_parent_tree_idx" ON "post_${slug}" (thread,parent, subpath(path, 0, 1));
    `),//speeds up parent_tree sort
          DB.query(`
      CREATE INDEX "post_${slug}_created_idx" ON "post_${slug}" USING btree(created);
      `),
      DB.query(`
      CREATE INDEX "post_${slug}_p_tree_with_idx" ON "post_${slug}" (thread, parent, id);
      `),
      DB.query(`
    CREATE INDEX "post_${slug}_author_idx" ON "post_${slug}" USING btree(LOWER(author));
    `)
    ])
    await Promise.all(indexes)
  } catch ( e ) {
    console.log(e)
    throw e
  }
}
/*
        WITH tree AS (
        SELECT subpath(path, 0, 1) as st FROM "post_5p-nbi2r9tl38" post
        WHERE thread=5000 AND parent = 0 AND id > '00749797'::int
        ORDER BY id ASC LIMIT 17
        )
      SELECT post.id, post.parent, post.author,
      post.message, post.forum, post.thread, post.created FROM tree
      JOIN "post_5p-nbi2r9tl38" post ON tree.st = subpath(post.path, 0, 1) AND thread=5000
      ORDER BY subpath(post.path, 0, 1) ASC, post.path ASC

 */