const valid = thread => {
  try {
    const {title, author, message, created} = thread
    
    if (typeof title !== 'string') return false
    if (typeof author !== 'string') return false
    if (typeof message !== 'string') return false
    if (typeof created !== 'string'&&
      typeof created !== 'object' &&
      !Array.isArray(created)) return false
    
  } catch (e) {
    return false
  }
  return true
}

const validAny = thread => {
  try {
    if ('title' in thread && typeof thread.title !== 'string') return false
    if ('author' in thread && typeof thread.author !== 'string') return false
    if ('message' in thread && typeof thread.message !== 'string') return false
    if ('created' in thread &&
      typeof thread.created !== 'string'&&
      typeof thread.created !== 'object' &&
      !Array.isArray(thread.created)) return false
    
  } catch (e) {
    return false
  }
  return true
}

const CREATE = async (thread, slug) => {
  console.log('thread created', thread)
  return thread
}

const UPDATE = async (thread, slug) => {
  console.log('thread updated')
  return thread
}

const GET = async (slug) => {
  console.log('get thread')
}

const GET_POSTS = async (params) => {
  console.log('get posts')
}

const CREATE_VOTE = async (voice, slug) => {
  console.log(voice, slug)
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