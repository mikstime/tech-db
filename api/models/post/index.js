const valid = post => {
  return true;
}

const validAny = post => {
  try {
    
    if('message' in post && typeof post.message !== 'string') return false;
    
  } catch ( e ) {
    return false
  }
  return true;
}

const CREATE = async ({}, id) => {
}

const UPDATE = async ({}, id) => {
  console.log('user updated')
}

const GET = async (id) => {
  console.log('get post');
}

export const POST_MODEL = {
  CREATE,
  UPDATE,
  GET,
  valid,
  validAny,
}

export default POST_MODEL;