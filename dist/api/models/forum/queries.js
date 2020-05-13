"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET_USERS_QUERY = exports.GET_QUERY = exports.GET_EXISTING_QUERY = exports.CREATE_QUERY = void 0;
var CREATE_QUERY = "INSERT INTO forum(\"user\", title, slug)\nSELECT nickname AS \"user\", $2 AS title, $3 AS slug FROM users\nWHERE LOWER(nickname)=LOWER($1)\nRETURNING \"user\", title, slug";
exports.CREATE_QUERY = CREATE_QUERY;
var GET_EXISTING_QUERY = "SELECT \"user\", title, slug\nFROM forum\nWHERE LOWER(slug)=LOWER($1)";
exports.GET_EXISTING_QUERY = GET_EXISTING_QUERY;
var GET_QUERY = "SELECT \"user\", title, slug, threads, posts\nFROM forum\nWHERE LOWER(forum.slug)=LOWER($1)";
exports.GET_QUERY = GET_QUERY;

var GET_USERS_QUERY = function GET_USERS_QUERY(query) {
  var ORDER_TYPE = 'desc' in query ? query.desc === 'true' ? 'DESC' : 'ASC' : '';
  var LIMIT = Number(query.limit) ? "LIMIT ".concat(query.limit) : 'LIMIT 100';
  var SINCE = 'since' in query ? "AND LOWER(author) ".concat(ORDER_TYPE === 'DESC' ? '<' : '>', " LOWER($2)") : '';
  return "WITH U AS (\n(SELECT DISTINCT ON (LOWER(author)) T.author as nickname FROM thread T WHERE LOWER(T.forum)=LOWER($1) ".concat(SINCE, " ORDER BY LOWER(author) ").concat(ORDER_TYPE, " ").concat(LIMIT, ")\nUNION ALL\n(SELECT DISTINCT ON (LOWER(author)) P.author as nickname FROM post P WHERE LOWER(P.forum)=LOWER($1) ").concat(SINCE, " ORDER BY LOWER(author) ").concat(ORDER_TYPE, " ").concat(LIMIT, ")\n)\nSELECT DISTINCT ON (LOWER(U.nickname)) * FROM U\nLEFT JOIN users UU ON LOWER(U.nickname)=LOWER(UU.nickname)\nORDER BY LOWER(U.nickname) ").concat(ORDER_TYPE, " ").concat(LIMIT);
  /**
   const LIMIT = Number(query.limit) ?
   `LIMIT ${ query.limit }` : 'LIMIT 100'
   
   const SINCE = 'since' in query ?
   `AND LOWER(author) ${ ORDER_TYPE === 'DESC' ? '<' : '>' } LOWER($2)` : ''
   
   return`WITH U AS (
   (SELECT T.author as nickname FROM thread T WHERE LOWER(T.forum)=LOWER($1) ${SINCE} ${LIMIT})
   UNION
   (SELECT P.author as nickname FROM post P WHERE LOWER(P.forum)=LOWER($1) ${SINCE} ${LIMIT})
   )
   SELECT * FROM U
   LEFT JOIN users UU ON LOWER(U.nickname)=LOWER(UU.nickname)
   ORDER BY U.nickname ${ ORDER_TYPE } ${ LIMIT }`
   */
};

exports.GET_USERS_QUERY = GET_USERS_QUERY;