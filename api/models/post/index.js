import DB from '../index'
import THREAD_MODEL from '../thread'
import FORUM_MODEL from '../forum'
const numTo12lenStr = (num) => {
  const s = num.toString()
  return '0'.repeat(12 - s.length) + s
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
    const thread = await client.query(`
    SELECT * FROM thread WHERE ${ isNaN(slug) ? 'slug' : 'id' }=$1`, [ slug ])
    
    const { id, forum } = thread.rows[ 0 ]
    
    if ( !id ) {
      client.query('ROLLBACK')
      return null
    }
    if ( !posts.length ) {
      await client.query('COMMIT')
      return []
    }
    let l = 0
    const [ args, values ] = posts.reduce((acc, p) => {
      if ( acc[ 0 ].length )
        acc[ 1 ] += ','
      acc[ 0 ].push(p.parent || 0, p.author, p.message, forum, id)
      if ( p.created )
        acc[ 0 ].push(p.created)
      acc[ 0 ].push('')
      acc[ 1 ] += `($${ ++l }, $${ ++l }, $${ ++l }, $${ ++l }, $${ ++l },${ p.created ? `$${ ++l },` : 'NOW(),' } $${ ++l })`
      return acc
    }, [ [], 'VALUES ' ])
    
    const res = await client.query(`
    INSERT INTO post(parent, author, message, forum, thread, created, path) ${ values }
    RETURNING *
    `, args)
    
    await Promise.all(res.rows.map(async (post, i) => {
      let parentPath = ''
      const { parent, id } = post
      const user = await DB.query(`SELECT nickname FROM users WHERE nickname=$1`, [post.author])
      if(!user.rows.length) {
        throw new Error('Author not found')
      }
      if ( parent ) {
        const parentPost = (await client.query(`
          SELECT * FROM post
          WHERE id=$1`, [ parent ])).rows[ 0 ]
        if(!parentPost || parentPost.thread !== thread.rows[ 0 ].id) {
          throw new Error('Parent post was created in another thread')
        }
        parentPath = parentPost.path
      }
      if ( !parentPath ) {
        await client.query(`
            UPDATE post SET path ='${ numTo12lenStr(id) }' WHERE post.id=$1
            `, [ id ])
      } else {
        await client.query(`
            UPDATE post SET path = '${ parentPath + '.' + numTo12lenStr(id) }' WHERE post.id=$1
           `, [ id ])
      }
      if ( !parent )
        delete post.parent
    }))
    client.query('COMMIT')
    return res.rows
    
  } catch ( e ) {
    client.query('ROLLBACK')
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
    if(!message && message !== '') {
      post.rows[0].isEdited = false
      return post.rows[0]
    }
    const postEdited = await DB.query(`
  UPDATE post SET message = $1
  WHERE id=$2
  RETURNING author, created, forum, id, message, thread`, [ message, id ])
  
    if(post.rows[0].message !== postEdited.rows[0].message) {
      postEdited.rows[0].isEdited = true
      await DB.query(`UPDATE post SET "isEdited"=TRUE WHERE id=$1`, [id])
    } else {
      postEdited.rows[0].isEdited = false
    }
    return postEdited.rows[0]
  }catch ( e ) {
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
  SELECT author, created, forum, id, message, thread, "isEdited"
  FROM post WHERE id=$1`, [ id ])
    
    if ( !post.rows.length ) {
      throw new Error('Post not found')
    }
    result.post = post.rows[ 0 ]
    if(!result.post.isEdited)
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