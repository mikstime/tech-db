export const CREATE_QUERY =
`INSERT INTO forum("user", title, slug)
SELECT nickname AS "user", $2 AS title, $3 AS slug FROM users
WHERE LOWER(nickname)=LOWER($1)
RETURNING "user", title, slug`

export const GET_EXISTING_QUERY =
`SELECT "user", title, slug
FROM forum
WHERE LOWER(slug)=LOWER($1)`

export const GET_QUERY =
`SELECT "user", title, slug, threads, posts
FROM forum
WHERE LOWER(forum.slug)=LOWER($1) LIMIT 1`

export const GET_USERS_QUERY = (query) => {
  const ORDER_TYPE = 'desc' in query ?
    query.desc === 'true' ? 'DESC' : 'ASC' : ''
  
  const LIMIT = Number(query.limit) ?
    `LIMIT ${ query.limit }` : 'LIMIT 100'
  
  const SINCE = 'since' in query ?
    `AND LOWER(forum_users.nickname) ${ ORDER_TYPE === 'DESC' ? '<' : '>' } LOWER($2)` : ''
  
  return`
SELECT users.* FROM forum_users
JOIN users ON LOWER(forum_users.nickname)=LOWER(users.nickname)
WHERE LOWER(forum)=LOWER($1) ${SINCE}
ORDER BY LOWER(users.nickname) ${ ORDER_TYPE } ${LIMIT}`
}