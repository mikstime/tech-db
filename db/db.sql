CREATE EXTENSION IF NOT EXISTS CITEXT;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    nickname CITEXT COLLATE "C" NOT NULL UNIQUE,
    fullname VARCHAR(50) NOT NULL,
    email CITEXT NOT NULL UNIQUE,
    about TEXT
);

CREATE TABLE forum
(
    id SERIAL PRIMARY KEY,
    "user" CITEXT COLLATE "C" NOT NULL,
    title CITEXT COLLATE "C" NOT NULL,
    slug VARCHAR(50) UNIQUE
);

CREATE TABLE thread
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    author CITEXT COLLATE "C" NOT NULL,
    forum CITEXT COLLATE "C" NOT NULL,
    message TEXT,
    slug CITEXT COLLATE "C" UNIQUE,
    created timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE post
(
    id SERIAL PRIMARY KEY,
    parent int,
    author CITEXT COLLATE "C" NOT NULL,
    message TEXT,
    forum CITEXT COLLATE "C" NOT NULL,
    "thread" int,
    created timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE vote
(
    thread_id int,
    "user" CITEXT COLLATE "C" NOT NULL,
    voice int,
    UNIQUE("user", thread_id)
);