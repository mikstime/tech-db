export const CREATE_QUERY =
`INSERT INTO thread(forum, author, title, message, slug, created)
SELECT (
SELECT forum.slug FROM forum WHERE LOWER(slug)=LOWER($5)
) AS forum,
(SELECT nickname FROM users WHERE LOWER(nickname)=LOWER($1)
) AS author,
$2 AS title, $3 AS message, $4 AS slug, $6 AS created
RETURNING id, forum, author, title, message, slug, created`

export const FAKE_UPDATE_THREADS_GET_FORUM_QUERY =
`UPDATE forum SET (threads, threads_updated) = (
SELECT COUNT(id), FALSE FROM thread WHERE LOWER(thread.forum)=LOWER($1))
WHERE LOWER(slug)=LOWER($1)
RETURNING slug, "user", title, threads, posts`

export const UPDATE_THREADS_GET_FORUM_QUERY =
`UPDATE forum SET (threads, threads_updated) = (
SELECT COUNT(id), TRUE FROM thread WHERE LOWER(thread.forum)=LOWER($1))
WHERE LOWER(slug)=LOWER($1)
RETURNING slug, "user", title, threads, posts`

export const UPDATE_FORUM_POST_COUNTER_QUERY = (amount = 1) =>
`WITH OLD_COUNT AS(
SELECT posts FROM forum WHERE LOWER(slug)=LOWER($1)
)
UPDATE forum SET
posts = OLD_COUNT.posts + ${amount}
FROM OLD_COUNT
WHERE LOWER(slug)=LOWER($1)
RETURNING forum.posts`

export const UPDATE_THREAD_POST_COUNTER_QUERY = (amount = 1) =>
`WITH OLD_COUNT AS(
SELECT posts FROM thread WHERE id=$1
)
UPDATE thread SET
posts = OLD_COUNT.posts + ${amount}
FROM OLD_COUNT
WHERE id=$1
RETURNING thread.posts`

export const GET_EXISTING_QUERY = slug =>
`SELECT id, title, author, forum, message, slug, created
FROM thread WHERE ${isNaN(slug) ? 'LOWER(slug)=LOWER($1)' : 'id=$1'}`

export const GET_QUERY = slug =>
`SELECT id, title, author, forum, message, slug, created, posts, votes, votes_updated, posts_updated
FROM thread
WHERE ${ isNaN(slug) ? 'LOWER(slug)=LOWER($1)' : 'id=$1' }
GROUP BY thread.id`

export const CREATE_VOTE_QUERY = (slug) =>
`INSERT INTO vote
SELECT thread.id AS thread_id, $1 as "user", $2 AS voice FROM thread
JOIN users ON LOWER(users.nickname)=LOWER($1)
WHERE ${ isNaN(slug) ? 'LOWER(slug)' : 'id' }=${ isNaN(slug) ? 'LOWER($3)' : '$3' }
RETURNING thread_id, "user"`

export const FAKE_UPDATE_VOTES_GET_THREAD_QUERY =
`WITH selected AS (
SELECT DISTINCT on (LOWER("user")) voice, created FROM vote WHERE thread_id=$1
GROUP BY LOWER("user"), created, voice
ORDER BY LOWER("user"), created DESC)
UPDATE thread SET(votes, votes_updated) =
(
SELECT SUM(selected.voice), TRUE FROM selected WHERE thread.id=$1)
WHERE id=$1
RETURNING id, title, author, forum, message, slug,
created, posts, votes, votes_updated, posts_updated`

export const UPDATE_VOTES_GET_THREAD_QUERY =
  `WITH selected AS (
SELECT DISTINCT on (LOWER("user")) voice, created FROM vote WHERE thread_id=$1
GROUP BY LOWER("user"), created, voice
ORDER BY LOWER("user"), created DESC)
UPDATE thread SET(votes, votes_updated) =
(
SELECT SUM(selected.voice), TRUE FROM selected WHERE thread.id=$1)
WHERE id=$1
RETURNING id, title, author, forum, message, slug,
created, posts, votes, votes_updated, posts_updated`

/*
INSERT INTO vote
SELECT thread.id AS thread_id, 'ac.4Z58TvVPs5KlP1' as "user", 1 AS voice FROM thread
JOIN users ON LOWER(users.nickname)=LOWER('ac.4Z58TvVPs5KlP1')
WHERE thread.id=4003
RETURNING thread_id, "user"
 */
/*
WITH OLD_COUNT AS(
SELECT posts FROM forum WHERE LOWER(slug)=LOWER('0hG54U-K9c3a8')
)
UPDATE forum SET
posts = OLD_COUNT.posts + 1
FROM OLD_COUNT
WHERE LOWER(slug)=LOWER('0hG54U-K9c3a8')
RETURNING forum.posts
 */

/*
WITH selected AS (
SELECT DISTINCT on (LOWER("user")) voice, created FROM vote WHERE thread_id=3043
GROUP BY LOWER("user"), created, voice
ORDER BY LOWER("user"), created DESC)
UPDATE thread SET(votes, votes_updated) =
(
SELECT SUM(selected.voice), TRUE FROM selected WHERE thread.id=3043)
WHERE id=3043
RETURNING id, title, author, forum, message, slug,
created, posts, votes, votes_updated, posts_updated
 */

/*
WITH OLD_COUNT AS(
SELECT posts FROM thread WHERE id=2832
)
UPDATE thread SET
posts = OLD_COUNT.posts + 1
FROM OLD_COUNT
WHERE id=2832
RETURNING thread.posts
 */

/*
INSERT INTO post(id,parent, author, message, forum, thread, created, path)
(SELECT nextval('post_id_seq'),
COALESCE(V.parent::int, 0),
V.author, V.message, $1 as forum,
COALESCE(post.thread, $2::int),
COALESCE(V.created::timestamptz,NOW()),
text2ltree(COALESCE(post.path::text || '.', '') || LPAD(currval('post_id_seq')::text, 8, '0')) as path
FROM (VALUES ${ values }) V(parent, author, message, created, ind)
LEFT JOIN post ON V.parent::int=post.id AND LOWER(post.forum)=LOWER($1)
JOIN users ON LOWER(users.nickname)=LOWER(V.author)
ORDER BY ind ASC
)
RETURNING id, parent, author, message, forum, thread, created, path
 */