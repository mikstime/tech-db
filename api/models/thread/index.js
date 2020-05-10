import DB from '../index'
import pg from 'pg'
import {
  CREATE_QUERY,
  GET_EXISTING_QUERY,
  UPDATE_THREAD_COUNTER_QUERY
} from './queries'

const { Pool } = pg
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
    
    if(!thread.rows.length) {
      await client.query('ROLLBACK')
      return null
    }
    if(!thread.rows[0].slug)
      delete thread.rows[0].slug
    
    const updated = await client.query(UPDATE_THREAD_COUNTER_QUERY, [forum])
    await client.query('COMMIT')
    return thread.rows[ 0 ]
  } catch ( e ) {
    await client.query('ROLLBACK')
    console.log(e)
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
    WHERE ${ isNaN(slug) ? 'slug_lower' : 'id' }=${ isNaN(slug) ? `LOWER($1)` : `$1` }`, [ slug ])
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
WHERE ${ isNaN(slug) ? 'slug_lower' : 'id' }=${ isNaN(slug) ? `LOWER($${ args.length })` : `$${ args.length }` }
RETURNING id, title, author, forum, message, slug, created
  `, args)
    return thread.rows[ 0 ]
  } catch ( e ) {
    console.log(e)
  }
}

const GET = async (slug) => {
  const thread = await DB.query(`
SELECT thread.id, thread.title, thread.author, thread.forum,
       thread.message, thread.slug, thread.created,
       SUM(vote.voice) as votes, COUNT(post.author) as posts
FROM thread
LEFT JOIN vote ON vote.thread_id = thread.id
LEFT JOIN post ON post.thread = thread.id
WHERE thread.${ isNaN(slug) ? 'slug_lower' : 'id' }=${ isNaN(slug) ? 'LOWER($1)' : '$1' }
GROUP BY thread.id
  `, [ slug ])
  if ( !thread.rows[ 0 ] )
    throw new Error('thread not found')
  if ( !thread.rows[ 0 ].slug )
    delete thread.rows[ 0 ].slug
  thread.rows[ 0 ].votes = Number(thread.rows[ 0 ].votes) || 0
  thread.rows[ 0 ].posts = Number(thread.rows[ 0 ].posts) || 0
  return thread.rows[ 0 ]
  
}

const GET_V = async (slug) => {
  const thread = await DB.query(`
SELECT thread.id, thread.title, thread.author, thread.forum,
       thread.message, thread.slug, thread.created,
       SUM(vote.voice) as votes
FROM thread
LEFT JOIN vote ON vote.thread_id = thread.id
WHERE thread.${ isNaN(slug) ? 'slug_lower' : 'id' }=${ isNaN(slug) ? 'LOWER($1)' : '$1' }
GROUP BY thread.id
  `, [ slug ])
  if ( !thread.rows[ 0 ] )
    throw new Error('thread not found')
  if ( !thread.rows[ 0 ].slug )
    delete thread.rows[ 0 ].slug
  
  thread.rows[ 0 ].votes = Number(thread.rows[ 0 ].votes) || 0
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
    
    const threadId = (await client.query(`
        SELECT id FROM thread
        WHERE ${ isNaN(slug) ? 'slug_lower' : 'id' }=${
      isNaN(slug) ? 'LOWER($1)' : '$1' }`, [ slug ])).rows[ 0 ].id
    
    if ( !threadId ) {
      await client.query('ROLLBACK')
      return null
    }
    
    const LIMIT = Number(query.limit) ? `LIMIT ${ Number(query.limit) }` : 'LIMIT 100'
    
    const ORDER_TYPE = query.desc === 'true' ? 'DESC' :
      query.desc === 'false' ? 'ASC' : ''
    
    const SINCE = Number(query.since) ? `AND post.id > ${ query.since }` : ''
    if ( query.sort === 'flat' ) {
      const SINCE = Number(query.since) ? `AND post.id ${ ORDER_TYPE === 'DESC' ? '<' : '>' } ${ query.since }` : ''
      //  parent, author, message, forum, thread, created,
      const posts = await client.query(`
        SELECT id, parent, author, message, forum, thread, created
        FROM post WHERE thread=$1 ${ SINCE }
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
        SINCE = `WHERE path ${ ORDER_TYPE === 'DESC' ? '<' : '>' } '${ path }'`
      }
      const posts = await client.query(`
      WITH RECURSIVE tree AS (
        SELECT
        ARRAY[]::LTREE[] || post.path AS sortable,
        id, parent, author, message, forum, thread, created, path
        FROM post
        WHERE parent = 0 AND thread=$1
        UNION ALL
        SELECT
        tree.sortable ||  subpath(post.path, -1, 1),
        post.id, post.parent, post.author, post.message,
        post.forum, post.thread, post.created, post.path
  FROM post, tree
  WHERE post.parent = tree.id
      )
      SELECT * FROM tree ${ SINCE }
    ORDER BY sortable ${ ORDER_TYPE } ${ LIMIT }
      `, [ threadId ])
      
      await client.query('COMMIT')
      return posts.rows.map(r => {
        delete r.sortable
        delete r.path
        return r
      })
    }
    
    if ( query.sort === 'parent_tree' ) {
      let SINCE = ''
      if ( query.since ) {
        const path = (await client.query(`
      SELECT path FROM post WHERE id=$1`, [ query.since ])).rows[ 0 ].path
        // SINCE = `AND path >= '${path}'`
        SINCE = `AND post.path ${ ORDER_TYPE === 'DESC' ? '<' : '>' } '${ path.split('.')[ 0 ] }'`
      }
      const posts = await client.query(`
      WITH RECURSIVE tree AS (
        (SELECT
        ARRAY[]::LTREE[] || post.path AS sortable,
        id, parent, author, message, forum, thread, created, path
        FROM post
        WHERE parent = 0 AND thread=$1 ${ SINCE }
        ORDER BY id ${ ORDER_TYPE } ${ LIMIT }
        )
       UNION ALL
       SELECT
       tree.sortable ||  post.path,
       post.id, post.parent, post.author, post.message,
       post.forum, post.thread, post.created, post.path
       FROM post, tree
       WHERE post.parent = tree.id
      )
      SELECT *, subpath(path, 0, 1) as st FROM tree
      ORDER BY st ${ ORDER_TYPE }, path ASC
      `, [ threadId ])
      
      await client.query('COMMIT')
      return posts.rows.map(r => {
        delete r.sortable
        delete r.path
        return r
      })
    }
    
    // const SINCE2 = Number(query.since) ? `AND post.id > ${query.since}` : ''
    const SINCE2 = Number(query.since) ? `AND post.id ${ ORDER_TYPE === 'DESC' ? '<' : '>' } ${ query.since }` : ''
    const posts = await client.query(`
        SELECT id, parent, author, message, forum, thread, created
        FROM post WHERE thread=$1 ${ SINCE2 }
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
    const x = await client.query(`
    INSERT INTO vote
    SELECT thread.id AS thread_id, $1 as "user", $2 AS voice FROM thread
    JOIN users ON users.nickname=$1
    WHERE thread.${ isNaN(slug) ? 'slug_lower' : 'id' }=${ isNaN(slug) ? 'LOWER($3)' : '$3' }
    ON CONFLICT ("user", thread_id) DO
    UPDATE SET voice=$2
    RETURNING TRUE as status`, [ nickname, voice, slug ])
    if ( !x.rows.length )
      throw new Error('User or thread not found')
    await client.query('COMMIT')
    const thread = await GET_V(slug)
    return thread
  } catch ( e ) {
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