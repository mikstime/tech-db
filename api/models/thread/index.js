import DB from '../index'
import pg from 'pg'
const {Pool} = pg;

const valid = thread => {
  try {
    const { title, author, message, created } = thread
    
    if ( typeof title !== 'string' ) return false
    if ( typeof author !== 'string' ) return false
    if ( typeof message !== 'string' ) return false
    if ( typeof created !== 'string' &&
      typeof created !== 'object' &&
      !Array.isArray(created) ) return false
    
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

const CREATE = async ({ title, author, message, created, slug }, forum) => {
  const client = await DB.connect();
  try {
    await client.query('BEGIN')
    const x = await client.query(`
    INSERT INTO thread(title, author, forum, message, slug)
    SELECT $2 AS title, users.nickname AS author,
        forum.slug as forum, $3 AS message, $4 as slug FROM users
    JOIN forum ON forum.slug=$5
    WHERE users.nickname=$1
    RETURNING id, title, author, forum, message,
        slug, created, 0 as votes, 0 as posts`,
      [author, title, message, slug, forum])
    
    if(!x.rows.length)
      return
    
    await client.query('COMMIT')
    if(x.rows[0] && !x.rows[0].slug)
      delete x.rows[0].slug
    return x.rows[0]
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    console.log(123)
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
SELECT thread.*, COUNT(vote.user) as votes, COUNT(post.author) as posts
FROM thread
LEFT JOIN vote ON vote.thread_id = thread.id
LEFT JOIN post ON post.thread = thread.id
WHERE thread.${ isNaN(slug) ? 'slug' : 'id' }=$1
GROUP BY thread.id
  `, [ slug ])
  if ( !thread.rows[ 0 ] )
    throw new Error('thread not found')
  if ( !thread.rows[ 0 ].slug )
    delete thread.rows[ 0 ].slug
  return thread.rows[ 0 ]
  
}

const GET_POSTS = async (slug) => {
  const thread = await DB.query(`
SELECT P.*, T.id as thread FROM thread T
LEFT JOIN post P ON T.id = P.thread
WHERE T.${ isNaN(slug) ? 'slug' : 'id' }=$1`, [ slug ])
  
  if ( thread.rows[ 0 ].thread === null ) {
    throw new Error(`thread not found`)
  } else if ( thread.rows[ 0 ].id === null )
    return []
  return thread.rows
}

const CREATE_VOTE = async ({ nickname, voice }, slug) => {
  const client = await DB.connect();
  try {
    await client.query('BEGIN')
    const x = await client.query(`
    INSERT INTO vote
    SELECT thread.id AS thread_id, $1 as "user", $2 AS voice FROM thread
    JOIN users ON users.nickname=$1
    WHERE thread.${ isNaN(slug) ? 'slug' : 'id' }=$3
    ON CONFLICT ("user", thread_id) DO
    UPDATE SET voice=$2
    RETURNING TRUE as status`, [ nickname, voice, slug ])
    if(!x.rows.length)
      throw new Error('User or thread not found')
    await client.query('COMMIT');
    const thread = await GET(slug);
    return thread;
  } catch ( e ) {
    await client.query('ROLLBACK');
    throw new Error(`thread or user does not exists`)
  } finally {
    client.release();
  }
  
}

export const THREAD_MODEL = {
  CREATE,
  CREATE_VOTE,
  UPDATE,
  GET,
  GET_POSTS,
  valid,
  validAny,
}

export default THREAD_MODEL