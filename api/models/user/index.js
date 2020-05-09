import DB from '../index'

const valid = user => {
  try {
    const { fullname, about, email } = user
    
    if ( typeof fullname !== 'string' ) return false
    if ( typeof about !== 'string' ) return false
    if ( typeof email !== 'string' ) return false
    
  } catch ( e ) {
    return false
  }
  return true
}

const validAny = user => {
  if ( 'fullname' in user && typeof user.fullname !== 'string' ) return false
  if ( 'about' in user && typeof user.about !== 'string' ) return false
  if ( 'email' in user && typeof user.email !== 'string' ) return false
  return true
}

const CREATE = async ({ fullname, about, email }, nickname) => {
  try {
    const user = await DB.query(`
INSERT INTO users(nickname, fullname, email, email_lower, about)
VALUES ($1, $2, $3, LOWER($4), $5)
RETURNING nickname, fullname, email, about
  `, [ nickname, fullname, email, email, about ])
  
    if ( !user.rows[ 0 ] )
      throw new Error()
    return user.rows[ 0 ]
  } catch ( e ) {
    throw e;
  }
}

const UPDATE = async ({ fullname, about, email }, nickname) => {
  let set = ''
  let args = []
  if ( fullname ) {
    args.push(fullname)
    set += `fullname=$${ args.length }`
    if ( about || email )
      set += ','
  }
  
  if ( about ) {
    args.push(about)
    set += `about=$${ args.length }`
    if ( email )
      set += ','
  }
  if ( email ) {
    args.push(email)
    args.push(email)
    set += `email=$${ args.length - 1}, email_lower=LOWER($${args.length})`
  }
  args.push(nickname)
  if(args.length !== 1) {
    const user = await DB.query(`
UPDATE users
SET ${ set }
WHERE nickname=$${ args.length }
RETURNING nickname, fullname, email, about`, args)
  
    return user.rows[ 0 ]
  } else {
    const user = await DB.query(`
SELECT nickname, fullname, email, about FROM users WHERE nickname=$1`, args)
  
    return user.rows[ 0 ]
  }
}

const GET = async (nickname) => {
  const user = await DB.query(`
SELECT nickname, fullname, email, about FROM users WHERE nickname=$1;`, [ nickname ])
  
  if ( !user.rows[ 0 ] )
    throw new Error('user not found')
  return user.rows[ 0 ]
}

const GET_EMAIL = async (email) => {
  const user = await DB.query(`
SELECT nickname, fullname, email, about FROM users WHERE email_lower=LOWER($1)`, [ email ])
  
  if ( !user.rows.length )
    throw new Error('user was not found')
  return user.rows
}

export const USER_MODEL = {
  GET_EMAIL,
  CREATE,
  UPDATE,
  GET,
  valid,
  validAny,
}

export default USER_MODEL