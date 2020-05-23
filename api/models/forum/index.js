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
  const client = await DB.connect()
  
  try {
    await client.query('BEGIN')
    const forum = await client.query(CREATE_QUERY, [ user, title, slug ])
    //@TODO create post partition
    if ( !forum.rows.length )
      return null
    const tableName = `post_${ forum.rows[ 0 ].slug.toLowerCase() }`
    const x = await client.query(`
    CREATE UNLOGGED TABLE "${ tableName }" PARTITION OF post FOR VALUES IN ('${ forum.rows[ 0 ].slug.toLowerCase() }');
    `);
    await Promise.all(
      [
        client.query(`
    CREATE INDEX "${ tableName }_id_idx" ON "${ tableName }" USING btree(id);
    `), client.query(`
    CREATE INDEX "${ tableName }_path_idx" ON "${ tableName }" USING gist(path);
    `), client.query(`
    CREATE INDEX "${ tableName }_path_st_idx" ON "${ tableName }" USING gist(subpath(path,0, 1));
    `), client.query(`
    CREATE INDEX "${ tableName }_path_st_path_idx" ON "${ tableName }" (subpath(path,0, 1), path);
    `), client.query(`
    CREATE INDEX "${ tableName }_since_tree_idx" ON "${ tableName }" (thread, path);
    `), client.query(`
    CREATE INDEX "${ tableName }_since_idx" ON "${ tableName }" (parent, thread, path);
    `), client.query(`
    CREATE INDEX "${ tableName }_parent_idx" ON "${ tableName }" USING btree(parent);
    `), client.query(`
        CREATE INDEX "${ tableName }_parent_hash_idx" ON "${ tableName }" USING hash(parent);
    `), client.query(`
    CREATE INDEX "${ tableName }_thread_idx" ON "${ tableName }" USING btree(thread);
    `), client.query(`
    CREATE INDEX "${ tableName }_parent_thread_idx" ON "${ tableName }" USING btree(parent, thread);
    `), client.query(`
    CREATE INDEX "${ tableName }_created_idx" ON "${ tableName }" USING btree(created);
    `),
        client.query(`
    CREATE INDEX "${ tableName }_author_idx" ON "${ tableName }" USING btree(LOWER(author));
    `)
      ]
    )
    // await client.query(`
    // CREATE INDEX "${tableName}_forum_idx" ON "${tableName}" USING btree(LOWER(forum));
    // `)
    // await client.query(`
    // CREATE INDEX "${tableName}_author_forum_idx" ON "${tableName}" (LOWER(forum), LOWER(author));
    // `)
    
    await client.query('COMMIT')
    return forum.rows[ 0 ]
  } catch ( e ) {
    console.log(e)
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
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
  if ( !forum.rows[ 0 ].threads_updated ) {
    forum = await DB.query(UPDATE_THREADS_GET_FORUM_QUERY, [ slug ])
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