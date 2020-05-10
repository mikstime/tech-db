export const CREATE_QUERY =
`INSERT INTO thread(forum, author, title, message, slug, created)
SELECT (
SELECT forum.slug FROM forum WHERE LOWER(slug)=LOWER($5)
) AS forum,
(SELECT nickname FROM users WHERE LOWER(nickname)=LOWER($1)
) AS author,
$2 AS title, $3 AS message, $4 AS slug, $6 AS created
RETURNING id, forum, author, title, message, slug, created`

export const UPDATE_THREAD_COUNTER_QUERY =
`WITH OLD_COUNT AS(
SELECT threads FROM forum WHERE LOWER(slug)=LOWER($1)
)
UPDATE forum SET
threads = OLD_COUNT.threads + 1
FROM OLD_COUNT
WHERE LOWER(slug)=LOWER($1)
RETURNING forum.threads`

export const GET_EXISTING_QUERY = slug =>
`SELECT id, title, author, forum, message, slug, created
FROM thread WHERE ${isNaN(slug) ? 'LOWER(slug)=LOWER($1)' : 'id=$1'}`