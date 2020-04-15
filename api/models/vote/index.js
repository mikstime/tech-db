
const valid = user => {
  try {
    const {nickname, voice} = user;
    
    if(typeof nickname !== 'string') return false;
    if(typeof voice !== 'number') return false;
    
  } catch ( e ) {
    return false
  }
  return true;
}

export const VOTE_MODEL = {
  valid,
}

export default VOTE_MODEL;