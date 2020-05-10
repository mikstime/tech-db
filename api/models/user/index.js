import DB from '../index'
import {
  CREATE_QUERY,
  GET_EXISTING_QUERY,
  GET_QUERY,
  UPDATE_QUERY
} from './queries'

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
    const user = await DB.query(CREATE_QUERY, [ nickname, fullname, email, about ])
    
    return user.rows[ 0 ]
  } catch ( e ) {
    throw e
  }
}
const prepareFields = (fields) =>
  Object.entries(fields).reduce((acc, field) => {
    if ( field[ 1 ] !== undefined ) {
      acc[ 0 ].push(field[ 1 ])
      if ( acc[1] !== '' )
        acc[ 1 ] += ','
      acc[ 1 ] += `${ field[ 0 ] }=$${ acc[ 0 ].length }`
    }
    return acc
  }, [ [], '' ])

const UPDATE = async ({ fullname, about, email }, nickname) => {
  const [args, fields] = prepareFields({fullname, about, email})
  args.push(nickname)
  
  let user;
  
  if ( args.length !== 1 ) {
    user = (await DB.query(UPDATE_QUERY(fields, args.length), args)).rows[0]
  } else {
    user = (await DB.query(GET_QUERY, [ nickname ])).rows[ 0 ]
  }
  return user
}

const GET = async (nickname) => {
  const user = await DB.query(GET_QUERY, [ nickname ])
  return user.rows[ 0 ]
}

const GET_EXISTING = async ({ email }, nickname) => {
  const user = await DB.query(GET_EXISTING_QUERY, [ nickname, email ])
  
  if ( !user.rows.length )
    throw new Error('Unable to get user by id or email')
  
  return user.rows
}

export const USER_MODEL = {
  CREATE,
  UPDATE,
  GET,
  GET_EXISTING,
  valid,
  validAny,
}

export default USER_MODEL