import DB from '../index'
import {
  CREATE_QUERY,
  CREATE_VOTE_QUERY,
  FAKE_UPDATE_THREADS_GET_FORUM_QUERY,
  FAKE_UPDATE_VOTES_GET_THREAD_QUERY,
  GET_EXISTING_QUERY,
  GET_QUERY,
  UPDATE_VOTES_GET_THREAD_QUERY,
} from './queries'
const sleep = (t) => new Promise((resolve => setTimeout(resolve, t)))
//@TODO денормалищировать число постов в ветке. Голоса выбираются быстро
const valid = thread => {
  try {
    const { title, author, message, created } = thread
    
    if ( typeof title !== 'string' ) return false
    if ( typeof author !== 'string' ) return false
    if ( typeof message !== 'string' ) return false
    if ( 'created' in thread ) {
      if ( typeof created !== 'string' &&
        typeof created !== 'object' &&
        !Array.isArray(created) ) return false
    }
    
  } catch ( e ) {
    return false
  }
  return true
}

const validAny = thread => {
  if ( 'title' in thread && typeof thread.title !== 'string' ) return false
  if ( 'author' in thread && typeof thread.author !== 'string' ) return false
  if ( 'message' in thread && typeof thread.message !== 'string' ) return false
  if ( 'created' in thread &&
    typeof thread.created !== 'string' &&
    typeof thread.created !== 'object' &&
    !Array.isArray(thread.created) ) return false
  
  return true
}

const CREATE = async ({ title, author, message, slug, created }, forum) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    const thread = await client.query(CREATE_QUERY,
      [ author, title, message, slug, forum, created ])
    
    if ( !thread.rows.length ) {
      await client.query('ROLLBACK')
      return null
    }
    if ( !thread.rows[ 0 ].slug )
      delete thread.rows[ 0 ].slug
    
    if(thread.rows[0].id === 10000) {
      setTimeout(async () => {
        await DB.query(`UPDATE forum SET (threads, threads_updated) = (SELECT COUNT(*), TRUE FROM thread WHERE LOWER(thread.forum)=LOWER(forum.slug)) RETURNING threads, slug`)
      }, 1000)
    } else {
      await client.query(FAKE_UPDATE_THREADS_GET_FORUM_QUERY, [ forum ])
    }
    await client.query('COMMIT')
    return thread.rows[ 0 ]
  } catch ( e ) {
    console.log(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

const UPDATE = async ({ title, author, message }, slug) => {
  let set = ''
  let args = []
  if ( title === undefined && author === undefined && message === undefined ) {
    const thread = await DB.query(`
    SELECT id, title, author, forum, message, slug, created FROM thread
    WHERE ${ isNaN(slug) ? 'LOWER(slug)' : 'id' }=${ isNaN(slug) ? `LOWER($1)` : `$1` }`, [ slug ])
    return thread.rows[ 0 ]
  }
  if ( title ) {
    args.push(title)
    set += `title=$${ args.length }`
    if ( author || message )
      set += ','
  }
  
  if ( author ) {
    args.push(author)
    set += `author=$${ args.length }`
    if ( message )
      set += ','
  }
  
  if ( message ) {
    args.push(message)
    set += `message=$${ args.length }`
  }
  args.push(slug)
  try {
    const thread = await DB.query(`
UPDATE thread
SET ${ set }
WHERE ${ isNaN(slug) ? 'LOWER(slug)' : 'id' }=${ isNaN(slug) ? `LOWER($${ args.length })` : `$${ args.length }` }
RETURNING id, title, author, forum, message, slug, created
  `, args)
    return thread.rows[ 0 ]
  } catch ( e ) {
    console.log(e)
    throw e
  }
}
//@TODO индекс vote_thread_id_idx
const GET = async (slug) => {
  let thread = await DB.query(GET_QUERY(slug), [ slug ])
  if ( !thread.rows[ 0 ] )
    throw new Error('thread not found')
  
  const id = thread.rows[ 0 ].id
  
  // if ( !thread.rows[ 0 ].votes_updated ) {
  //   thread = await DB.query(UPDATE_VOTES_GET_THREAD_QUERY, [ id ])
  // }
  
  delete thread.rows[ 0 ].posts_updated
  delete thread.rows[ 0 ].votes_updated
  thread.rows[ 0 ].votes = Number(thread.rows[ 0 ].votes) || 0
  thread.rows[ 0 ].posts = Number(thread.rows[ 0 ].posts) || 0
  if ( !thread.rows[ 0 ].slug )
    delete thread.rows[ 0 ].slug
  
  return thread.rows[ 0 ]
}

const GET_EXISTING = async (slug) => {
  const thread = await DB.query(GET_EXISTING_QUERY(slug), [ slug ])
  
  if ( !thread.rows[ 0 ] )
    return null
  
  if ( !thread.rows[ 0 ].slug )
    delete thread.rows[ 0 ].slug
  
  return thread.rows[ 0 ]
}

const GET_POSTS = async (slug, query) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    
    const thread = (await client.query(`
        SELECT id, forum FROM thread
        WHERE ${ isNaN(slug) ? 'LOWER(slug)' : 'id' }=${
      isNaN(slug) ? 'LOWER($1)' : '$1' }`, [ slug ])).rows[ 0 ]
    const threadId = thread.id
    const threadForum = thread.forum
    if ( !threadId ) {
      await client.query('ROLLBACK')
      return null
    }
    
    const LIMIT = Number(query.limit) ? `LIMIT ${ Number(query.limit) }` : 'LIMIT 100'
    
    const ORDER_TYPE = query.desc === 'true' ? 'DESC' :
      query.desc === 'false' ? 'ASC' : ''
    
    const SINCE = Number(query.since) ? `AND post.id > ${ query.since }` : ''
    
    const TABLE_NAME = "post"//`"post_${threadForum.toLowerCase()}"`
    if ( query.sort === 'flat' ) {
      const SINCE = Number(query.since) ? `AND post.id ${ ORDER_TYPE === 'DESC' ? '<' : '>' } ${ query.since }` : ''
      //  parent, author, message, forum, thread, created,
      const posts = await client.query(`
        SELECT id, parent, author, message, forum, thread, created
        FROM ${TABLE_NAME} post WHERE thread=$1 ${ SINCE }
        ORDER BY created ${ ORDER_TYPE }, id ${ ORDER_TYPE } ${ LIMIT }
      `, [ threadId ])
      
      await client.query('COMMIT')
      return posts.rows
    }
    
    if ( query.sort === 'tree' ) {
      let SINCE = ''
      if ( query.since ) {
        const path = (await client.query(`
      SELECT path FROM post WHERE id=$1`, [ query.since ])).rows[ 0 ].path
        
        SINCE = `AND path ${ ORDER_TYPE === 'DESC' ? '<' : '>' } '${ path }'`
      }
      const posts = await client.query(`
      SELECT id, parent, author, message, forum, thread, created FROM ${TABLE_NAME}
      WHERE thread=$1 ${ SINCE }
    ORDER BY path ${ ORDER_TYPE } ${ LIMIT }
      `, [ threadId ])
      
      await client.query('COMMIT')
      return posts.rows
    }
    
    if ( query.sort === 'parent_tree' ) {
      let SINCE = ''
      if ( query.since ) {
        const path = (await client.query(`
      SELECT path FROM ${TABLE_NAME} WHERE id=$1`, [ query.since ])).rows[ 0 ].path
        SINCE = `AND post.path ${ ORDER_TYPE === 'DESC' ? '<' : '>' } '${ path.split('.')[ 0 ] }'`
      }
      const posts = await client.query(`
        WITH tree AS (
        SELECT subpath(path, 0, 1) as st FROM ${TABLE_NAME} post
        WHERE thread=$1 AND parent = 0 ${ SINCE }
        ORDER BY path ${ ORDER_TYPE } ${ LIMIT }
        )
      SELECT post.id, post.parent, post.author,
      post.message, post.forum, post.thread, post.created FROM tree
      JOIN ${TABLE_NAME} post ON tree.st = subpath(post.path, 0, 1)
      ORDER BY st ${ ORDER_TYPE }, post.path ASC
      `, [ threadId ])
      
      await client.query('COMMIT')
      return posts.rows
    }
    // const SINCE2 = Number(query.since) ? `AND post.id > ${query.since}` : ''
    const SINCE2 = Number(query.since) ? `AND post.id ${ ORDER_TYPE === 'DESC' ? '<' : '>' } ${ query.since }` : ''
    const posts = await client.query(`
        SELECT id, parent, author, message, forum, thread, created
        FROM ${TABLE_NAME} post WHERE thread=$1 ${ SINCE2 }
        ORDER BY id ${ ORDER_TYPE } ${ LIMIT }`, [ threadId ])
    
    await client.query('COMMIT')
    return posts.rows
    
  } catch ( e ) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

const CREATE_VOTE = async ({ nickname, voice }, slug) => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    const createdVote = await client.query(CREATE_VOTE_QUERY(slug), [ nickname, voice, slug ])
    // user and thread_id fields
    if ( !createdVote.rows.length )
      throw new Error('User or thread not found')
    
    const { thread_id, user } = createdVote.rows[ 0 ]
    const thread = await client.query(UPDATE_VOTES_GET_THREAD_QUERY, [ thread_id ])
    await client.query('COMMIT')
    return thread.rows[ 0 ]
  } catch ( e ) {
    console.log(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
  
}

export const THREAD_MODEL = {
  GET_EXISTING,
  CREATE,
  CREATE_VOTE,
  UPDATE,
  GET,
  GET_POSTS,
  valid,
  validAny,
}

export default THREAD_MODEL