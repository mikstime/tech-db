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
  try {
    await DB.query(`
  TRUNCATE TABLE users, post, thread, forum, vote`)
  } catch ( e ) {
    console.log(e)
  }
}

export const SERVICE_MODEL = {
  GET,
  DELETE,
}

export default SERVICE_MODEL;