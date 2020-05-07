import DB from '../index'

const valid = post => {
  try {
    const { parent, message } = post
    
    if ( typeof parent !== 'number' ) return false
    if ( typeof message !== 'string' ) return false
    
  } catch ( e ) {
    return false
  }
  return true
}

const validAny = post => {
  if ( 'parent' in post && typeof post.parent !== 'number' ) return false
  if ( 'message' in post && typeof post.message !== 'string' ) return false
  return true
}
const validList = posts => {
  try {
    for ( let post of posts ) {
      const { parent, message } = post
      
      if ( typeof parent !== 'number' ) return false
      if ( typeof message !== 'string' ) return false
    }
  } catch ( e ) {
    return false
  }
  return true
}

const validAnyList = posts => {
  for ( let post of posts ) {
    if ( 'parent' in post && typeof post.parent !== 'number' ) return false
    if ( 'message' in post && typeof post.message !== 'string' ) return false
  }
  return true
}

const CREATE = async (posts, thread) => {
  let values = ''
  posts.length > 0 && (values = 'VALUES ')
  
  posts.forEach(({parent, author, message}) =>
    values += `('${parent}', '${author}', '${message}', '${thread.forum}', '${thread.id}'),`)
  if(values[values.length - 1] === ',')
    values = values.slice(0, -1)
  //@TODO check if user exists and thread/parent exists
  const created = await DB.query(`
  INSERT INTO post(parent, author, message, forum, thread)
  ${values}
  RETURNING *`)
  console.log(created.rows)
  return created.rows
}

const UPDATE = async ({}, id) => {
  console.log('user updated')
}

const GET = async (id) => {
  console.log('get post')
}

export const POST_MODEL = {
  validList,
  validAnyList,
  CREATE,
  UPDATE,
  GET,
  valid,
  validAny,
}

export default POST_MODEL