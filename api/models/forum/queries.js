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
