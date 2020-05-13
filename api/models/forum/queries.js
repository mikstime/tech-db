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
WHERE LOWER(forum.slug)=LOWER($1)`

export const GET_USERS_QUERY = (query) => {
  const ORDER_TYPE = 'desc' in query ?
    query.desc === 'true' ? 'DESC' : 'ASC' : ''
  
  const LIMIT = Number(query.limit) ?
    `LIMIT ${ query.limit }` : 'LIMIT 100'
  
  const SINCE = 'since' in query ?
    `AND LOWER(author) ${ ORDER_TYPE === 'DESC' ? '<' : '>' } LOWER($2)` : ''
  
  return`WITH U AS (
(SELECT DISTINCT ON (LOWER(author)) T.author as nickname FROM thread T WHERE LOWER(T.forum)=LOWER($1) ${SINCE} ORDER BY LOWER(author) ${ORDER_TYPE} ${LIMIT})
UNION ALL
(SELECT DISTINCT ON (LOWER(author)) P.author as nickname FROM post P WHERE LOWER(P.forum)=LOWER($1) ${SINCE} ORDER BY LOWER(author) ${ORDER_TYPE} ${LIMIT})
)
SELECT DISTINCT ON (LOWER(U.nickname)) * FROM U
LEFT JOIN users UU ON LOWER(U.nickname)=LOWER(UU.nickname)
ORDER BY LOWER(U.nickname) ${ ORDER_TYPE } ${LIMIT}`
  /**
   const LIMIT = Number(query.limit) ?
   `LIMIT ${ query.limit }` : 'LIMIT 100'
   
   const SINCE = 'since' in query ?
   `AND LOWER(author) ${ ORDER_TYPE === 'DESC' ? '<' : '>' } LOWER($2)` : ''
   
   return`WITH U AS (
   (SELECT T.author as nickname FROM thread T WHERE LOWER(T.forum)=LOWER($1) ${SINCE} ${LIMIT})
   UNION
   (SELECT P.author as nickname FROM post P WHERE LOWER(P.forum)=LOWER($1) ${SINCE} ${LIMIT})
   )
   SELECT * FROM U
   LEFT JOIN users UU ON LOWER(U.nickname)=LOWER(UU.nickname)
   ORDER BY U.nickname ${ ORDER_TYPE } ${ LIMIT }`
   */
}