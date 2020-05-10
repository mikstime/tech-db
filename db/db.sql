CREATE EXTENSION IF NOT EXISTS CITEXT;
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE users
(
    nickname VARCHAR(50) UNIQUE PRIMARY KEY,
    fullname VARCHAR(50) NOT NULL,
    email CITEXT NOT NULL,
    about CITEXT
);
--AVOID DUPLICATES, QUICK SEARCH AND JOIN(email not needed for search and join)
CREATE UNIQUE INDEX user_email_lower_idx ON users USING btree(LOWER(email));
CREATE UNIQUE INDEX user_nickname_lower_idx ON users USING btree(LOWER(nickname));

CREATE TABLE forum
(
    slug VARCHAR(50) NOT NULL PRIMARY KEY,
    "user" CITEXT COLLATE "C" NOT NULL,
    title CITEXT COLLATE "C" NOT NULL,
    threads INT DEFAULT 0, --DENORMALIZATION
    posts INT DEFAULT 0--DENORMALIZATION
);
--AVOID DUPLICATES, QUICK SEARCH AND JOIN
CREATE UNIQUE INDEX forum_slug_lower_idx ON forum USING btree(LOWER(slug));
--@TODO LOWER(post.forum) index
CREATE TABLE thread
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    author CITEXT COLLATE "C" NOT NULL,
    forum CITEXT COLLATE "C" NOT NULL,
    message TEXT,
    slug CITEXT COLLATE "C",
    created timestamptz,
    posts INT
);
--AVOID DUPLICATES, QUICK SEARCH AND JOIN
CREATE UNIQUE INDEX thread_slug_lower_idx ON thread USING btree(LOWER(slug));
CREATE INDEX thread_id_idx ON thread USING btree(id);
CREATE INDEX thread_created_idx ON thread USING btree(created);

CREATE TABLE post
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
) PARTITION BY RANGE (thread);

CREATE TABLE thread_1 PARTITION OF test FOR VALUES FROM (0) TO (1000);
CREATE TABLE thread_2 PARTITION OF test FOR VALUES FROM (10001) TO (20000);
CREATE TABLE thread_3 PARTITION OF test FOR VALUES FROM (20001) TO (30000);
CREATE TABLE thread_4 PARTITION OF test FOR VALUES FROM (30001) TO (40000);
CREATE TABLE thread_5 PARTITION OF test FOR VALUES FROM (40001) TO (50000);
CREATE TABLE thread_6 PARTITION OF test FOR VALUES FROM (50001) TO (60000);
CREATE TABLE thread_7 PARTITION OF test FOR VALUES FROM (60001) TO (70000);
CREATE TABLE thread_8 PARTITION OF test FOR VALUES FROM (70001) TO (80000);
CREATE TABLE thread_9 PARTITION OF test FOR VALUES FROM (80001) TO (90000);
CREATE TABLE thread_10 PARTITION OF test FOR VALUES FROM (90001) TO (110000);

CREATE TABLE vote
(
    thread_id int,
    "user" CITEXT COLLATE "C" NOT NULL,
    voice int,
    UNIQUE("user", thread_id)
);

CREATE INDEX post_path_idx ON post USING gist (path);

CREATE INDEX thread_forum ON thread (LOWER(forum));
CREATE INDEX post_forum ON post (LOWER(forum));

CREATE INDEX post_parent ON post (parent);
CREATE INDEX post_thread ON post (thread);
CREATE INDEX post_parent_thread ON post (parent, thread);


CREATE INDEX post_id ON post(id);


CREATE INDEX post_created ON post(created);

CREATE INDEX vote_thread_id ON vote(thread_id);