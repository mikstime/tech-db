"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CHECK_AUTHORS_AND_PARENTS_QUERY = exports.CREATE_QUERY = void 0;

var CREATE_QUERY = function CREATE_QUERY(threadId, values) {
  return "INSERT INTO post(parent, author, message, forum, thread, created, path) VALUES ".concat(values, "\nRETURNING *");
};

exports.CREATE_QUERY = CREATE_QUERY;

var CHECK_AUTHORS_AND_PARENTS_QUERY = function CHECK_AUTHORS_AND_PARENTS_QUERY(p) {
  return "SELECT nickname ".concat(p ? ',post.path, post.thread' : '', " FROM users\n").concat(p ? 'LEFT JOIN post ON post.id=$2' : '', "\nWHERE nickname=$1");
};

exports.CHECK_AUTHORS_AND_PARENTS_QUERY = CHECK_AUTHORS_AND_PARENTS_QUERY;