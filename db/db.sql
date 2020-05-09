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
    "isEdited" BOOLEAN DEFAULT FALSE,
    message TEXT,
    forum CITEXT COLLATE "C" NOT NULL,
    "thread" int,
    created timestamp NOT NULL DEFAULT NOW()
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

CREATE INDEX thread_forum ON thread (LOWER(forum));
CREATE INDEX post_forum ON post (LOWER(forum));

CREATE INDEX forum_slug_lower ON forum (slug_lower);

CREATE INDEX post_parent ON post (parent);
CREATE INDEX post_thread ON post (thread);
CREATE INDEX post_parent_thread ON post (parent, thread);

CREATE INDEX user_nickname ON users(nickname);

CREATE INDEX thread_id ON thread (id);
CREATE INDEX thread_slug_lower ON thread (slug_lower);

CREATE INDEX post_id ON post(id);

CREATE INDEX thread_created ON thread(created);

CREATE INDEX post_created ON post(created);