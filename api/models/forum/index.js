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
    const forum = await DB.query(`
    SELECT   forum.id, "user", forum.title, forum.slug, COUNT(DISTINCT post.id) as posts, COUNT(DISTINCT thread.id) AS threads
    FROM forum
    LEFT JOIN thread ON LOWER(thread.forum)=LOWER($1)
    LEFT JOIN post ON LOWER(post.forum)=LOWER($1)
    WHERE forum.slug_lower=LOWER($1)
    GROUP BY forum.id, "user", forum.title, forum.slug`, [slug])
  
    if(!forum.rows.length) {
      throw new Error('Forum not found')
    }
    forum.rows[0].threads = Number(forum.rows[0].threads)
    forum.rows[0].posts = Number(forum.rows[0].posts)
    return forum.rows[0]
}

const GET_USERS = async (slug, query) => {
  try {
    const ORDER_TYPE = 'desc' in query ? query.desc === 'true' ? 'DESC' : 'ASC' : ''
    const LIMIT = Number(query.limit) ? `LIMIT ${query.limit}` : 'LIMIT 100'
    const SINCE = 'since' in query ? `WHERE U.nickname ${ORDER_TYPE === 'DESC' ? '<' : '>'} $2`: ''
    const args = [slug]
    if(query.since)
      args.push(query.since)
    const users = await DB.query(`
WITH U AS (
SELECT T.author as nickname FROM thread T WHERE LOWER(T.forum)=LOWER($1)
UNION
SELECT P.author as nickname FROM post P WHERE LOWER(P.forum)=LOWER($1)
)
SELECT * FROM U
LEFT JOIN users UU ON U.nickname=UU.nickname
${SINCE}
ORDER BY U.nickname ${ORDER_TYPE} ${LIMIT}`, args)
    return users.rows
  } catch ( e ) {
    console.log(e)
    throw e
  }
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