export const CREATE_QUERY =
`INSERT INTO users(nickname, fullname, email, about)
VALUES ($1, $2, $3, $4)
RETURNING nickname, fullname, email, about`

export const GET_EXISTING_QUERY =
`SELECT nickname, fullname, email, about
FROM users
WHERE LOWER(nickname)=LOWER($1) OR LOWER(email)=LOWER($2)
LIMIT 2`

export const GET_QUERY =
`SELECT nickname, fullname, email, about
FROM users
WHERE LOWER(nickname)=LOWER($1)
LIMIT 1`

export const UPDATE_QUERY = (fields, nicknameArg) =>
`UPDATE users
SET ${fields}
WHERE LOWER(nickname)=LOWER($${nicknameArg})
RETURNING nickname, fullname, email, about`