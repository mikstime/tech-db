export const CREATE_QUERY = (threadId, values, tableName) =>
`INSERT INTO "${tableName || 'post'}"(parent, author, message, forum, thread, created, path) VALUES ${ values }
RETURNING *`

export const CHECK_AUTHORS_AND_PARENTS_QUERY = (p, tableName) =>
`SELECT nickname ${p ? ',post.path, post.thread' : ''} FROM users
${p ? `LEFT JOIN "${tableName}" post ON post.id=$2` : ''}
WHERE nickname=$1`