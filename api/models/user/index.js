
const valid = user => {
  try {
    const {fullname, about, email} = user;
    
    if(typeof fullname !== 'string') return false;
    if(typeof about !== 'string') return false;
    if(typeof email !== 'string') return false;

  } catch ( e ) {
    return false
  }
  return true;
}

const validAny = user => {
  try {
    
    if('fullname' in user && typeof user.fullname !== 'string') return false;
    if('about' in user && typeof user.about !== 'string') return false;
    if('email' in user && typeof user.email !== 'string') return false;
    
  } catch ( e ) {
    return false
  }
  return true;
}

const CREATE = async (user, nickname) => {
  console.log('user created', user, nickname)
  return {
    ...user,
    nickname,
  };
}

const UPDATE = async ({}, nickname) => {
  console.log('user updated')
}

const GET = async (nickname) => {
  console.log('get user');
}
export const USER_MODEL = {
  CREATE,
  UPDATE,
  GET,
  valid,
  validAny,
}

export default USER_MODEL;