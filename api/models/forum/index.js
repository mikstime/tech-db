import DB from '../index'

const valid = forum => {
  try {
    const { title, user, slug } = forum
    
    if ( typeof title !== 'string' ) return false
    if ( typeof user !== 'string' ) return false
    if ( typeof slug !== 'string' ) return false
    
  } catch ( e ) {
    return false
  }
  return true
}

const validAny = forum => {
  if ( 'title' in forum && typeof forum.title !== 'string' ) return false
  if ( 'user' in forum && typeof forum.user !== 'string' ) return false
  if ( 'slug' in forum && typeof forum.slug !== 'string' ) return false
  return true
}

const CREATE = async ({ user, title, slug }) => {
  const client = await DB.connect();
  try {
    await client.query('BEGIN')
    const x = await client.query(`
    INSERT INTO forum("user", title, slug)
    SELECT users.nickname AS "user", $2 AS title, $3 AS slug FROM users
    WHERE users.nickname=$1
    RETURNING "user", title, slug, 0 as threads, 1 as users`, [user, title, slug])
    if(!x.rows.length)
      throw new Error(`User not found`)
    
    await client.query('COMMIT')
    return x.rows[0]
  } catch (e) {
    await client.query('ROLLBACK')
    throw e;
  } finally {
    client.release()
  }
}

const GET = async slug => {
  const client = await DB.connect();
  try {
    await client.query('BEGIN')
    const forum = await client.query(`
        SELECT * FROM forum WHERE forum.slug=$1`, [slug])
    if(!forum)
      throw new Error('no forum found')
    
    const users= await client.query(`
        SELECT COUNT(DISTINCT u.author) as users FROM forum,
        (
            SELECT author FROM thread WHERE forum=$1
            UNION ALL
            SELECT author FROM post WHERE forum=$1
            UNION ALL
            SELECT "user" AS author FROM forum WHERE slug=$1
            ) AS u`, [ slug ])
    const threads = await client.query(`
    SELECT COUNT(id) as threads FROM thread WHERE forum=$1`, [slug])
    await client.query('COMMIT')
    
    const res = {
      ...forum.rows[0],
      users: Number(users.rows[0].users),
      threads: Number(threads.rows[0].threads),
    }
    
    return res;
  } catch ( e ) {
    throw e
  } finally {
    client.release()
  }
}

const GET_USERS = async slug => {
  const users = await DB.query(`
WITH U AS (
SELECT T.author as nickname FROM thread T WHERE T.forum=$1
UNION
SELECT P.author as nickname FROM post P WHERE P.forum=$1
UNION
SELECT "user" AS nickname FROM forum WHERE forum.slug=$1
)
SELECT * FROM U
LEFT JOIN users UU ON U.nickname=UU.nickname`, [ slug ])
  return users.rows
}

const GET_THREADS = async slug => {
  try {
    const threads = await DB.query(`
        SELECT T.*, COUNT(vote.thread_id) as votes
        FROM thread T
                 LEFT JOIN vote ON vote.thread_id = T.id
        WHERE forum = $1
        GROUP BY t.id`, [ slug ])
    
    threads.rows.forEach(t => t.slug ? t : (delete t.slug))
    return threads.rows
  } catch ( e ) {
    throw e
  }
}

export const FORUM_MODEL = {
  CREATE,
  GET,
  GET_USERS,
  GET_THREADS,
  valid,
  validAny,
}

export default FORUM_MODEL