CREATE EXTENSION IF NOT EXISTS CITEXT;
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    nickname CITEXT COLLATE "C" NOT NULL UNIQUE,
    fullname VARCHAR(50) NOT NULL,
    email CITEXT NOT NULL,
    email_lower CITEXT NOT NULL UNIQUE,
    about TEXT
);

CREATE TABLE forum
(
    id SERIAL PRIMARY KEY,
    "user" CITEXT COLLATE "C" NOT NULL,
    title CITEXT COLLATE "C" NOT NULL,
    slug VARCHAR(50) NOT NULL,
    slug_lower VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE thread
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    author CITEXT COLLATE "C" NOT NULL,
    forum CITEXT COLLATE "C" NOT NULL,
    message TEXT,
    slug CITEXT COLLATE "C",
    slug_lower CITEXT COLLATE "C" UNIQUE,
    created timestamptz
);

CREATE TABLE post
(
    id SERIAL PRIMARY KEY,
    parent int default 0 NOT NULL,
    author CITEXT COLLATE "C" NOT NULL,
    path ltree,
    message TEXT,
    forum CITEXT COLLATE "C" NOT NULL,
    "thread" int,
    created timestamp NOT NULL DEFAULT NOW(),
);

create index post_path_idx on post using gist (path);

CREATE TABLE vote
(
    thread_id int,
    "user" CITEXT COLLATE "C" NOT NULL,
    voice int,
    UNIQUE("user", thread_id)
);

CREATE UNIQUE INDEX user_email ON users (LOWER(email));