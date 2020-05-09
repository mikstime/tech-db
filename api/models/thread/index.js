import DB from '../index'
import pg from 'pg'

const { Pool } = pg

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
    const x = await client.query(`
    INSERT INTO thread(title, author, forum, message, slug, slug_lower, created)
    SELECT $2 AS title, users.nickname AS author,
        forum.slug as forum, $3 AS message, $4 AS slug, LOWER($5) AS slug_lower, $7 AS created FROM users
    JOIN forum ON forum.slug_lower=LOWER($6)
    WHERE users.nickname=$1
    RETURNING id, title, author, forum, message,
        slug, created`,
      [ author, title, message, slug, slug, forum, created ])
    if ( !x.rows.length ) {
      await client.query('ROLLBACK')
      return null
    }
    
    await client.query('COMMIT')
    if ( x.rows[ 0 ] && !x.rows[ 0 ].slug )
      delete x.rows[ 0 ].slug
    return x.rows[ 0 ]
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
WITH T AS (
UPDATE thread
SET ${ set }
WHERE ${ isNaN(slug) ? 'slug' : 'id' }=$${ args.length }
RETURNING *)
SELECT T.*, COUNT(post.author) as posts, count(vote.user) as votes FROM T
LEFT JOIN post ON T.id = post.thread
LEFT JOIN vote ON T.id = vote.thread_id
GROUP BY T.id, T.title, T.author, T.forum, T.message, T.slug, T.created
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

const GET_FAST = async (slug) => {
  
  const thread = await DB.query(`
SELECT  id, title, author, forum, message, slug, created
FROM thread
WHERE thread.${ isNaN(slug) ? 'slug' : 'id' }=$1
  `, [ slug ])
  if ( !thread.rows[ 0 ] )
    throw new Error('thread not found')
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
        isNaN(slug) ? 'LOWER($1)' : '$1' }`, [ slug ])).rows[0].id
    
    if ( !threadId ) {
      await client.query('ROLLBACK')
      return null
    }
    
    const LIMIT = Number(query.limit) ? `LIMIT ${Number(query.limit)}` : ''
    
    const ORDER_TYPE = query.desc === 'true' ? 'DESC' :
      query.desc === 'false' ? 'ASC' : ''
    
    const SINCE = Number(query.since) ? `AND post.id > ${query.since}` : ''
    if ( query.sort === 'flat' ) {
      //  parent, author, message, forum, thread, created,
      const posts = await client.query(`
        SELECT id, parent, author, message, forum, thread, created
        FROM post WHERE thread=$1 ${SINCE}
        ORDER BY created ${ORDER_TYPE}, id ${ORDER_TYPE} ${LIMIT}
      `, [ threadId ])
      
      await client.query('COMMIT')
      return posts.rows
    }
    
    if ( query.sort === 'tree' ) {
      let SINCE = ''
      if(query.since) {
        const path = (await client.query(`
      SELECT path FROM post WHERE id=$1`, [query.since])).rows[0].path
        SINCE = `WHERE path > '${path}'`
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
      SELECT * FROM tree ${SINCE}
    ORDER BY sortable ${ORDER_TYPE} ${LIMIT}
      `, [threadId])

      await client.query('COMMIT')
      return posts.rows.map(r => {delete r.sortable; delete r.path;return r;})
    }

    if (query.sort === 'parent_tree') {
      let SINCE = ''
      if(query.since) {
        const path = (await client.query(`
      SELECT path FROM post WHERE id=$1`, [query.since])).rows[0].path
        SINCE = `WHERE path > '${path}'`
      }
      const posts = await client.query(`
      WITH RECURSIVE tree AS (
        (SELECT
        ARRAY[]::LTREE[] || post.path AS sortable,
        id, parent, author, message, forum, thread, created, path
        FROM post
        WHERE parent = 0 AND thread=$1
        ${LIMIT}
        )
        UNION ALL
        SELECT
        tree.sortable ||  subpath(post.path, -1, 1),
        post.id, post.parent, post.author, post.message,
        post.forum, post.thread, post.created, post.path
  FROM post, tree
  WHERE post.parent = tree.id
      )
      SELECT * FROM tree ${SINCE}
      ORDER BY path ${ORDER_TYPE}, id ASC
      `, [threadId])
  
      await client.query('COMMIT')
      return posts.rows.map(r => {delete r.sortable; delete r.path;return r;})
      // const posts = await client.query(`
      //   SELECT id, parent, author, message, forum, thread, created, subpath(path, 0, 1) AS start
      //   FROM post WHERE thread=$1 ${SINCE}
      //   ORDER BY start ${ORDER_TYPE}, id ASC ${LIMIT}`, [ threadId ])
      //
      // await client.query('COMMIT')
      // return posts.rows.map(p => {delete p.start; return p})
    }
    const posts = await client.query(`
        SELECT id, parent, author, message, forum, thread, created
        FROM post WHERE thread=$1 ${SINCE}
        ORDER BY id ${ORDER_TYPE} ${LIMIT}`, [ threadId ])
    
    await client.query('COMMIT')
    return posts.rows
    
  } catch ( e ) {
    await client.query('ROLLBACK')
    console.log(e)
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
    console.log(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
  
}

export const THREAD_MODEL = {
  GET_FAST,
  CREATE,
  CREATE_VOTE,
  UPDATE,
  GET,
  GET_POSTS,
  valid,
  validAny,
}

export default THREAD_MODEL