import DB from '../index'

const numTo12lenStr = (num) => {
  const s = num.toString()
  return '0'.repeat(12 - s.length) + s
}

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
      if ( 'parent' in post ) {
        if ( typeof post.parent !== 'number' ) return false
      }
      if ( typeof post.message !== 'string' ) return false
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

const CREATE = async (posts, slug) => {
  
  const client = await DB.connect()
  try {
    await client.query('BEGIN')
    if(!posts.length)
      return []
    const thread = await client.query(`
    SELECT * FROM thread WHERE ${ isNaN(slug) ? 'slug' : 'id' }=$1`, [ slug ])
    
    const { id, forum } = thread.rows[ 0 ]
    
    if ( !id ) {
      client.query('ROLLBACK')
      return null
    }
    let l = 0
    const [ args, values ] = posts.reduce((acc, p) => {
      if ( acc[ 0 ].length )
        acc[ 1 ] += ','
      acc[ 0 ].push(p.parent || 0, p.author, p.message, forum, id)
      if ( p.created )
        acc[ 0 ].push(p.created)
      acc[ 0 ].push('')
      acc[ 1 ] += `($${ ++l }, $${ ++l }, $${ ++l }, $${ ++l }, $${ ++l },${ p.created ? `$${ ++l },` : 'NOW(),' } $${ ++l })`
      return acc
    }, [ [], 'VALUES ' ])
    
    const res = await client.query(`
    INSERT INTO post(parent, author, message, forum, thread, created, path) ${ values }
    RETURNING *
    `, args)
    
    await Promise.all(res.rows.map(async (post, i) => {
      let parentPath = ''
      const { parent, id } = post
      
      if ( parent ) {
        const parentPost = (await client.query(`
          SELECT * FROM post
          WHERE id=$1`, [ parent ])).rows[ 0 ]
  
        if ( !parentPost )
          throw new Error('parent not found')
  
        parentPath = parentPost.path
      }
        if ( !parentPath ) {
          console.log(id)
          await client.query(`
            UPDATE post SET path ='${ numTo12lenStr(id) }' WHERE post.id=$1
            `, [id])
        } else {
          await client.query(`
            UPDATE post SET path = '${ parentPath + '.' + numTo12lenStr(id) }' WHERE post.id=$1
           `, [id])
        }
        if ( !parent )
          delete post.parent
    }))
    // console.log(res.rows)
    // await Promise.all(posts.map(async ({parent, author, message, created}, i) => {
    //   let parentPath = ''
    //   if(parent) {
    //     const parentPost = (await client.query(`
    //     SELECT * FROM post
    //     WHERE id=$1`, [parent])).rows[0]
    //
    //     if(!parentPost)
    //       throw new Error('parent not found')
    //
    //     parentPath = parentPost.path
    //
    //   }
    //   const [args, keys, values] = prepareInsert({
    //     parent, author, message, forum, thread: id, created, path : parentPath
    //   })
    //
    //   const newPost = await client.query(`
    //     INSERT INTO post(${keys})
    //     VALUES(${values})
    //     RETURNING id, parent, author, message, forum, thread, created
    //     `, args)
    //     if(!parentPath) {
    //       await client.query(`
    //         UPDATE post SET path ='${numTo12lenStr(newPost.rows[0].id)}', "order"=$2 WHERE post.id=$1
    //     `, [newPost.rows[0].id, i])
    //     } else {
    //       await client.query(`
    //         UPDATE post SET path = '${parentPath + '.' + numTo12lenStr(newPost.rows[0].id)}', "order"=$2 WHERE post.id=$1
    //     `, [newPost.rows[0].id, i])
    //     }
    //   if(!newPost.rows[0].parent)
    //     delete newPost.rows[0].parent
    //
    //   res[i] = newPost.rows[0]
    // }));
    client.query('COMMIT')
    return res.rows
    
  } catch ( e ) {
    console.log(e)
    throw e
  } finally {
    client.release()
  }
}

const UPDATE = async ({}, id) => {
  console.log('user updated')
}

const GET = async (id) => {
}

const prepareInsert = (obj) => {
  let keys = ''
  let args = []
  let values = ''
  const input = Object.entries(obj)
  for ( let i = 0; i < input.length - 1; i++ ) {
    if ( input[ i ][ 1 ] !== undefined ) {
      keys += input[ i ][ 0 ] + ','
      args.push(input[ i ][ 1 ])
      values += `$${ args.length },`
    }
  }
  if ( input[ input.length - 1 ][ 1 ] !== undefined ) {
    keys += input[ input.length - 1 ][ 0 ]
    args.push(input[ input.length - 1 ][ 1 ])
    values += `$${ args.length }`
  } else {
    keys = keys.slice(0, -1)
    values = values.slice(0, -1)
  }
  
  return [ args, keys, values ]
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