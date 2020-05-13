"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_VOTES_GET_THREAD_QUERY = exports.FAKE_UPDATE_VOTES_GET_THREAD_QUERY = exports.CREATE_VOTE_QUERY = exports.GET_QUERY = exports.GET_EXISTING_QUERY = exports.UPDATE_THREAD_POST_COUNTER_QUERY = exports.UPDATE_FORUM_POST_COUNTER_QUERY = exports.UPDATE_THREADS_GET_FORUM_QUERY = exports.FAKE_UPDATE_THREADS_GET_FORUM_QUERY = exports.CREATE_QUERY = void 0;
var CREATE_QUERY = "INSERT INTO thread(forum, author, title, message, slug, created)\nSELECT (\nSELECT forum.slug FROM forum WHERE LOWER(slug)=LOWER($5)\n) AS forum,\n(SELECT nickname FROM users WHERE LOWER(nickname)=LOWER($1)\n) AS author,\n$2 AS title, $3 AS message, $4 AS slug, $6 AS created\nRETURNING id, forum, author, title, message, slug, created";
exports.CREATE_QUERY = CREATE_QUERY;
var FAKE_UPDATE_THREADS_GET_FORUM_QUERY = "UPDATE forum SET (threads, threads_updated) = (\nSELECT COUNT(id), FALSE FROM thread WHERE LOWER(thread.forum)=LOWER($1))\nWHERE LOWER(slug)=LOWER($1)\nRETURNING slug, \"user\", title, threads, posts";
exports.FAKE_UPDATE_THREADS_GET_FORUM_QUERY = FAKE_UPDATE_THREADS_GET_FORUM_QUERY;
var UPDATE_THREADS_GET_FORUM_QUERY = "UPDATE forum SET (threads, threads_updated) = (\nSELECT COUNT(id), TRUE FROM thread WHERE LOWER(thread.forum)=LOWER($1))\nWHERE LOWER(slug)=LOWER($1)\nRETURNING slug, \"user\", title, threads, posts";
exports.UPDATE_THREADS_GET_FORUM_QUERY = UPDATE_THREADS_GET_FORUM_QUERY;

var UPDATE_FORUM_POST_COUNTER_QUERY = function UPDATE_FORUM_POST_COUNTER_QUERY() {
  var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return "WITH OLD_COUNT AS(\nSELECT posts FROM forum WHERE LOWER(slug)=LOWER($1)\n)\nUPDATE forum SET\nposts = OLD_COUNT.posts + ".concat(amount, "\nFROM OLD_COUNT\nWHERE LOWER(slug)=LOWER($1)\nRETURNING forum.posts");
};

exports.UPDATE_FORUM_POST_COUNTER_QUERY = UPDATE_FORUM_POST_COUNTER_QUERY;

var UPDATE_THREAD_POST_COUNTER_QUERY = function UPDATE_THREAD_POST_COUNTER_QUERY() {
  var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return "WITH OLD_COUNT AS(\nSELECT posts FROM thread WHERE id=$1\n)\nUPDATE thread SET\nposts = OLD_COUNT.posts + ".concat(amount, "\nFROM OLD_COUNT\nWHERE id=$1\nRETURNING thread.posts");
};

exports.UPDATE_THREAD_POST_COUNTER_QUERY = UPDATE_THREAD_POST_COUNTER_QUERY;

var GET_EXISTING_QUERY = function GET_EXISTING_QUERY(slug) {
  return "SELECT id, title, author, forum, message, slug, created\nFROM thread WHERE ".concat(isNaN(slug) ? 'LOWER(slug)=LOWER($1)' : 'id=$1');
};

exports.GET_EXISTING_QUERY = GET_EXISTING_QUERY;

var GET_QUERY = function GET_QUERY(slug) {
  return "SELECT id, title, author, forum, message, slug, created, posts, votes, votes_updated, posts_updated\nFROM thread\nWHERE ".concat(isNaN(slug) ? 'LOWER(slug)=LOWER($1)' : 'id=$1', "\nGROUP BY thread.id");
};

exports.GET_QUERY = GET_QUERY;

var CREATE_VOTE_QUERY = function CREATE_VOTE_QUERY(slug) {
  return "INSERT INTO vote\nSELECT thread.id AS thread_id, $1 as \"user\", $2 AS voice FROM thread\nJOIN users ON users.nickname=$1\nWHERE ".concat(isNaN(slug) ? 'LOWER(slug)' : 'id', "=").concat(isNaN(slug) ? 'LOWER($3)' : '$3', "\nRETURNING thread_id, \"user\"");
};

exports.CREATE_VOTE_QUERY = CREATE_VOTE_QUERY;
var FAKE_UPDATE_VOTES_GET_THREAD_QUERY = "WITH selected AS (\nSELECT DISTINCT on (LOWER(\"user\")) voice, created FROM vote WHERE thread_id=$1\nGROUP BY LOWER(\"user\"), created, voice\nORDER BY LOWER(\"user\"), created DESC)\nUPDATE thread SET(votes, votes_updated) =\n(\nSELECT SUM(selected.voice), FALSE FROM selected WHERE thread.id=$1)\nWHERE id=$1\nRETURNING id, title, author, forum, message, slug,\ncreated, posts, votes, votes_updated, posts_updated";
exports.FAKE_UPDATE_VOTES_GET_THREAD_QUERY = FAKE_UPDATE_VOTES_GET_THREAD_QUERY;
var UPDATE_VOTES_GET_THREAD_QUERY = "WITH selected AS (\nSELECT DISTINCT on (LOWER(\"user\")) voice, created FROM vote WHERE thread_id=$1\nGROUP BY LOWER(\"user\"), created, voice\nORDER BY LOWER(\"user\"), created DESC)\nUPDATE thread SET(votes, votes_updated) =\n(\nSELECT SUM(selected.voice), TRUE FROM selected WHERE thread.id=$1)\nWHERE id=$1\nRETURNING id, title, author, forum, message, slug,\ncreated, posts, votes, votes_updated, posts_updated";
exports.UPDATE_VOTES_GET_THREAD_QUERY = UPDATE_VOTES_GET_THREAD_QUERY;