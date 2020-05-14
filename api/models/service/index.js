import DB from '../index'
const GET = async () => {
  try {
    const status = await DB.query(`
  WITH
  U AS (SELECT count(DISTINCT UU.*) as "user" FROM users  UU),
  F AS (SELECT count(DISTINCT FF.*) as forum  FROM forum  FF),
  T AS (SELECT count(DISTINCT TT.*) as thread FROM thread TT),
  P AS (SELECT count(DISTINCT PP.*) as post   FROM post   PP)
  SELECT * FROM U, F, T, P`)
    status.rows[0].user = Number(status.rows[0].user)
    status.rows[0].forum = Number(status.rows[0].forum)
    status.rows[0].thread = Number(status.rows[0].thread)
    status.rows[0].post = Number(status.rows[0].post)
    return status.rows[0]
  } catch ( e ) {
    console.log(e)
  }

}

const DELETE = async () => {
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    await client.query(`
  TRUNCATE TABLE users, post, forum, thread, vote RESTART IDENTITY CASCADE`)
    await client.query(`DROP TABLE post`)
    await client.query(`
    CREATE UNLOGGED TABLE post
(
    id SERIAL,
    parent int default 0 NOT NULL,
    author CITEXT COLLATE "C" NOT NULL,
    path ltree,
    "isEdited" BOOLEAN DEFAULT FALSE,
    message TEXT,
    forum CITEXT COLLATE "C" NOT NULL,
    "thread" int,
    created timestamp NOT NULL DEFAULT NOW()
) PARTITION BY LIST(LOWER(forum))
`)
    await client.query('COMMIT')
    await DB.query('VACUUM FULL')
  } catch ( e ) {
    await client.query('ROLLBACK')
    console.log(e)
    throw e
  } finally {
    client.release();
  }
}

export const SERVICE_MODEL = {
  GET,
  DELETE,
}

export default SERVICE_MODEL;