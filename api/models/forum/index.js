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
    INSERT INTO forum("user", title, slug, slug_lower)
    SELECT users.nickname AS "user", $2 AS title, $3 AS slug, LOWER($4) AS slug_lower FROM users
    WHERE users.nickname=$1
    RETURNING "user", title, slug, 0 as threads, 1 as users`, [user, title, slug, slug])
    await client.query('COMMIT')
    if(!x.rows.length)
      return null;
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
        SELECT * FROM forum WHERE forum.slug_lower=LOWER($1)`, [slug])
    if(!forum.rows.length) {
      await client.query('ROLLBACK')
      return null;
    }
    
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

const GET_THREADS = async (slug, query) => {
  try {
    const args = [slug];
    let options = ''
    options += `ORDER BY created ${query.desc === 'true' ? 'DESC' : ''} `;
    if(query.limit) {
      args.push(query.limit);
      options += `LIMIT $${args.length} `
    }
    let argSince;
    if(query.since) {
      args.push(query.since);
      argSince = args.length
    }
    console.log(options)
    const threads = await DB.query(`
        SELECT T.*
        FROM thread T
        WHERE forum = $1 ${argSince ? `AND created ${query.desc === 'true' ? '<=' : '>='} $${argSince}` : ''}
        GROUP BY t.id
        ${options}`, args)
    
    threads.rows.forEach(t => {
      t.slug ? t : (delete t.slug)
      t.created ? t : (delete t.created)
    })
    return threads.rows
  } catch ( e ) {
    console.log(e)
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