export const CREATE_QUERY = (threadId, values) =>
`INSERT INTO post(parent, author, message, forum, thread, created, path) VALUES ${ values }
RETURNING *`

export const CHECK_AUTHORS_AND_PARENTS_QUERY = (p) =>
`SELECT nickname ${p ? ',post.path, post.thread' : ''} FROM users
${p ? 'LEFT JOIN post ON post.id=$2' : ''}
WHERE nickname=$1`