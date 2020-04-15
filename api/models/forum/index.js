const valid = forum => {
  try {
    const {title, user, slug} = forum
    
    if (typeof title !== 'string') return false
    if (typeof user !== 'string') return false
    if (typeof slug !== 'string') return false
    
  } catch (e) {
    return false
  }
  return true
}

const validAny = forum => {
  try {
    
    if('title' in forum && typeof forum.title !== 'string') return false
    if('user' in forum && typeof forum.user !== 'string') return false
    if('slug' in forum && typeof forum.slug !== 'string') return false
    
  } catch (e) {
    return false
  }
  return true
}

const CREATE = async forum => {
  console.log('forum created', forum)
  return forum
}

const UPDATE = async (forum, slug) => {
  console.log('forum updated')
  return forum
}

const GET = async slug => {
  console.log('get forum')
}

const GET_USERS = async slug => {
  console.log('get users')
}

const GET_THREADS = async slug => {

}

export const FORUM_MODEL = {
  CREATE,
  UPDATE,
  GET,
  GET_USERS,
  GET_THREADS,
  valid,
  validAny,
}

export default FORUM_MODEL