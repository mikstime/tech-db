import DB from '../index'
import {
  CREATE_QUERY,
  GET_EXISTING_QUERY,
  GET_QUERY,
  GET_USERS_QUERY
} from './queries'
import { UPDATE_THREADS_GET_FORUM_QUERY } from '../thread/queries'
//@TODO денормализовать форум: увеличивать счетчик постов и веток при создании
// и отдавать их - автоматическое избавление от запросов длительностью 70+сек
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
  const forum = await DB.query(CREATE_QUERY, [ user, title, slug ])
  return forum.rows[ 0 ]
}

const GET_EXISTING = async slug => {
  const forum = await DB.query(GET_EXISTING_QUERY, [ slug ])
  return forum.rows[ 0 ]
}
const GET = async slug => {
  let forum = await DB.query(GET_QUERY, [ slug ])
  
  if ( !forum.rows.length ) {
    return undefined
  }
  if(!forum.rows[0].threads_updated) {
    forum = await DB.query(UPDATE_THREADS_GET_FORUM_QUERY, [slug])
  }
  delete forum.rows[ 0 ].threads_updated
  forum.rows[ 0 ].threads = Number(forum.rows[ 0 ].threads)
  forum.rows[ 0 ].posts = Number(forum.rows[ 0 ].posts)
  return forum.rows[ 0 ]
}

const GET_USERS = async (slug, query) => {
  const args = [ slug ]
  if ( query.since )
    args.push(query.since)
  try {
    const users = await DB.query(GET_USERS_QUERY(query), args)
    return users.rows
  } catch ( e ) {
    console.log(e)
    throw e
  }
}

const GET_THREADS = async (slug, query) => {
  try {
    const args = [ slug ]
    let options = ''
    options += `ORDER BY created ${ query.desc === 'true' ? 'DESC' : '' } `
    if ( query.limit ) {
      args.push(query.limit)
      options += `LIMIT $${ args.length } `
    } else {
      args.push(100)
      options += `LIMIT $${ args.length } `
    }
    let argSince
    if ( query.since ) {
      args.push(query.since)
      argSince = args.length
    }
    const threads = await DB.query(`
        SELECT id, title, author, forum, message, slug, created, votes, posts
        FROM thread
        WHERE LOWER(forum) = LOWER($1) ${ argSince ? `AND created ${ query.desc === 'true' ? '<=' : '>=' } $${ argSince }` : '' }
        ${ options }`, args)
    
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
  GET_EXISTING,
  GET_USERS,
  GET_THREADS,
  valid,
  validAny,
}

export default FORUM_MODEL