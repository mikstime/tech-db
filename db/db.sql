--SET synchronous_commit TO OFF;
--SET full_page_writes TO OFF;
--SET max_wal_size TO 2GB;
--SET checkpoint_timeout TO 1000;
CREATE EXTENSION IF NOT EXISTS CITEXT;
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE UNLOGGED TABLE users
(
    nickname VARCHAR(50) UNIQUE PRIMARY KEY,
    fullname VARCHAR(50) NOT NULL,
    email CITEXT NOT NULL,
    about CITEXT
);
--AVOID DUPLICATES, QUICK SEARCH AND JOIN(email not needed for search and join)
CREATE UNIQUE INDEX user_email_lower_idx ON users USING btree(LOWER(email));
CREATE UNIQUE INDEX user_nickname_lower_idx ON users USING btree(LOWER(nickname));
CREATE INDEX user_nickname_lower_hash_idx ON users USING hash(LOWER(nickname));
--Quick alphabet sort
--CREATE INDEX user_nickname ON users (nickname);
CREATE UNLOGGED TABLE forum
(
    slug VARCHAR(50) NOT NULL PRIMARY KEY,
    "user" CITEXT COLLATE "C" NOT NULL,
    title CITEXT COLLATE "C" NOT NULL,
    threads INT DEFAULT 0, --DENORMALIZATION
    threads_updated BOOLEAN DEFAULT FALSE,
    posts INT DEFAULT 0--DENORMALIZATION
);
--AVOID DUPLICATES, QUICK SEARCH AND JOIN
--@TODO partition using functions add keys automatically
CREATE UNIQUE INDEX forum_slug_lower_idx ON forum USING btree(LOWER(slug));
CREATE INDEX forum_slug_lower_hash_idx ON forum USING hash(LOWER(slug));
CREATE UNLOGGED TABLE thread
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    author CITEXT COLLATE "C" NOT NULL,
    forum CITEXT COLLATE "C" NOT NULL,
    message TEXT,
    slug CITEXT COLLATE "C",
    created timestamptz,
    posts INT DEFAULT 0,
    posts_updated BOOLEAN DEFAULT FALSE,
    votes INT DEFAULT 0,
    votes_updated BOOLEAN DEFAULT FALSE
);
--AVOID DUPLICATES, QUICK SEARCH AND JOIN
CREATE UNIQUE INDEX thread_slug_lower_idx ON thread USING btree(LOWER(slug));
CREATE INDEX thread_slug_lower_hash_idx ON thread USING hash(LOWER(slug));
--
CREATE INDEX thread_id_idx ON thread USING btree(id);
CREATE INDEX thread_id_hash_idx ON thread USING hash(id);
CREATE INDEX thread_created_idx ON thread USING btree(created);
--
CREATE INDEX thread_forum_idx ON thread USING btree(LOWER(forum));
CREATE INDEX thread_author_idx ON thread USING btree(LOWER(author));
CREATE INDEX thread_author_forum_idx ON thread (LOWER(forum), LOWER(author));

CREATE UNLOGGED TABLE post
(
    id SERIAL,
    parent int default 0 NOT NULL,
    author CITEXT COLLATE "C" NOT NULL,
    path ltree,
    "isEdited" BOOLEAN DEFAULT FALSE,
    message TEXT,
    forum CITEXT COLLATE "C" NOT NULL,
    "thread" int,
    created timestamp NOT NULL DEFAULT NOW()
) PARTITION BY LIST(LOWER(forum));

--CREATE INDEX post_id_idx ON post USING btree(id);
----
--CREATE INDEX post_path_idx ON post USING gist(path);
--CREATE INDEX post_path_st_idx ON post USING gist(subpath(path,0, 1)); --@TODO default path to avoid error (from 7s to 100ms)
--CREATE INDEX post_path_st_path_idx ON post (subpath(path,0, 1), path);
----
--CREATE INDEX post_since_tree_idx ON post (thread, path);
--CREATE INDEX post_since_idx ON post (parent, thread, path);
----
--CREATE INDEX post_parent_idx ON post USING btree(parent);
--CREATE INDEX post_thread_idx ON post USING btree(thread);
--CREATE INDEX post_parent_thread_idx ON post USING btree(parent, thread);
----
--CREATE INDEX post_created_idx ON post USING btree(created);
----
--CREATE INDEX post_author_idx ON post USING btree(LOWER(author));
--CREATE INDEX post_forum_lower_idx ON post USING btree(LOWER(forum));
--CREATE INDEX post_author_forum ON post(LOWER(author), LOWER(forum)); --search users

CREATE UNLOGGED TABLE vote
(
    thread_id int,
    "user" CITEXT COLLATE "C" NOT NULL,
    voice int,
    created timestamptz DEFAULT NOW()
);
CREATE INDEX vote_created_idx ON vote USING btree(created);
CREATE INDEX vote_user_idx ON vote USING btree(LOWER("user"));
CREATE INDEX vote_created_user_idx ON vote USING btree(LOWER("user"), created);
CREATE INDEX vote_thread_id_idx ON vote USING btree(thread_id);
CREATE INDEX vote_all ON vote (LOWER("user"), created, thread_id);

CREATE UNLOGGED TABLE posts
(
    forum CITEXT COLLATE "C" NOT NULL,
    thread int,
    posts int
);
CREATE INDEX posts_forum_idx ON posts USING hash(LOWER(forum));
CREATE INDEX posts_thread_idx ON posts USING hash(thread);

CREATE UNLOGGED TABLE forum_users
(
    forum CITEXT COLLATE "C" NOT NULL,
    nickname VARCHAR(50)
);
CREATE UNIQUE INDEX forum_users_forum_nickname ON forum_users (LOWER(forum), LOWER(nickname));
CREATE INDEX forum_users_forum ON forum_users USING hash(LOWER(forum));