"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.THREAD_MODEL = void 0;

var _index = _interopRequireDefault(require("../index"));

var _queries = require("./queries");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var sleep = function sleep(t) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, t);
  });
}; //@TODO денормалищировать число постов в ветке. Голоса выбираются быстро


var valid = function valid(thread) {
  try {
    var title = thread.title,
        author = thread.author,
        message = thread.message,
        created = thread.created;
    if (typeof title !== 'string') return false;
    if (typeof author !== 'string') return false;
    if (typeof message !== 'string') return false;

    if ('created' in thread) {
      if (typeof created !== 'string' && _typeof(created) !== 'object' && !Array.isArray(created)) return false;
    }
  } catch (e) {
    return false;
  }

  return true;
};

var validAny = function validAny(thread) {
  if ('title' in thread && typeof thread.title !== 'string') return false;
  if ('author' in thread && typeof thread.author !== 'string') return false;
  if ('message' in thread && typeof thread.message !== 'string') return false;
  if ('created' in thread && typeof thread.created !== 'string' && _typeof(thread.created) !== 'object' && !Array.isArray(thread.created)) return false;
  return true;
};

var CREATE = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref, forum) {
    var title, author, message, slug, created, client, thread;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            title = _ref.title, author = _ref.author, message = _ref.message, slug = _ref.slug, created = _ref.created;
            _context2.next = 3;
            return _index["default"].connect();

          case 3:
            client = _context2.sent;
            _context2.prev = 4;
            _context2.next = 7;
            return client.query('BEGIN');

          case 7:
            _context2.next = 9;
            return client.query(_queries.CREATE_QUERY, [author, title, message, slug, forum, created]);

          case 9:
            thread = _context2.sent;

            if (thread.rows.length) {
              _context2.next = 14;
              break;
            }

            _context2.next = 13;
            return client.query('ROLLBACK');

          case 13:
            return _context2.abrupt("return", null);

          case 14:
            if (!thread.rows[0].slug) delete thread.rows[0].slug;

            if (!(thread.rows[0].id === 10000)) {
              _context2.next = 19;
              break;
            }

            setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return _index["default"].query("UPDATE forum SET (threads, threads_updated) = (SELECT COUNT(*), TRUE FROM thread WHERE LOWER(thread.forum)=LOWER(forum.slug)) RETURNING threads, slug");

                    case 2:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            })), 1000);
            _context2.next = 21;
            break;

          case 19:
            _context2.next = 21;
            return client.query(_queries.FAKE_UPDATE_THREADS_GET_FORUM_QUERY, [forum]);

          case 21:
            _context2.next = 23;
            return client.query('COMMIT');

          case 23:
            return _context2.abrupt("return", thread.rows[0]);

          case 26:
            _context2.prev = 26;
            _context2.t0 = _context2["catch"](4);
            console.log(_context2.t0);
            _context2.next = 31;
            return client.query('ROLLBACK');

          case 31:
            throw _context2.t0;

          case 32:
            _context2.prev = 32;
            client.release();
            return _context2.finish(32);

          case 35:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[4, 26, 32, 35]]);
  }));

  return function CREATE(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var UPDATE = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4, slug) {
    var title, author, message, set, args, thread, _thread;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            title = _ref4.title, author = _ref4.author, message = _ref4.message;
            set = '';
            args = [];

            if (!(title === undefined && author === undefined && message === undefined)) {
              _context3.next = 8;
              break;
            }

            _context3.next = 6;
            return _index["default"].query("\n    SELECT id, title, author, forum, message, slug, created FROM thread\n    WHERE ".concat(isNaN(slug) ? 'LOWER(slug)' : 'id', "=").concat(isNaN(slug) ? "LOWER($1)" : "$1"), [slug]);

          case 6:
            thread = _context3.sent;
            return _context3.abrupt("return", thread.rows[0]);

          case 8:
            if (title) {
              args.push(title);
              set += "title=$".concat(args.length);
              if (author || message) set += ',';
            }

            if (author) {
              args.push(author);
              set += "author=$".concat(args.length);
              if (message) set += ',';
            }

            if (message) {
              args.push(message);
              set += "message=$".concat(args.length);
            }

            args.push(slug);
            _context3.prev = 12;
            _context3.next = 15;
            return _index["default"].query("\nUPDATE thread\nSET ".concat(set, "\nWHERE ").concat(isNaN(slug) ? 'LOWER(slug)' : 'id', "=").concat(isNaN(slug) ? "LOWER($".concat(args.length, ")") : "$".concat(args.length), "\nRETURNING id, title, author, forum, message, slug, created\n  "), args);

          case 15:
            _thread = _context3.sent;
            return _context3.abrupt("return", _thread.rows[0]);

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](12);
            console.log(_context3.t0);
            throw _context3.t0;

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[12, 19]]);
  }));

  return function UPDATE(_x3, _x4) {
    return _ref5.apply(this, arguments);
  };
}(); //@TODO индекс vote_thread_id_idx


var GET = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(slug) {
    var thread, id;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _index["default"].query((0, _queries.GET_QUERY)(slug), [slug]);

          case 2:
            thread = _context4.sent;

            if (thread.rows[0]) {
              _context4.next = 5;
              break;
            }

            throw new Error('thread not found');

          case 5:
            id = thread.rows[0].id; // if ( !thread.rows[ 0 ].votes_updated ) {
            //   thread = await DB.query(UPDATE_VOTES_GET_THREAD_QUERY, [ id ])
            // }

            delete thread.rows[0].posts_updated;
            delete thread.rows[0].votes_updated;
            thread.rows[0].votes = Number(thread.rows[0].votes) || 0;
            thread.rows[0].posts = Number(thread.rows[0].posts) || 0;
            if (!thread.rows[0].slug) delete thread.rows[0].slug;
            return _context4.abrupt("return", thread.rows[0]);

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function GET(_x5) {
    return _ref6.apply(this, arguments);
  };
}();

var GET_EXISTING = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(slug) {
    var thread;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _index["default"].query((0, _queries.GET_EXISTING_QUERY)(slug), [slug]);

          case 2:
            thread = _context5.sent;

            if (thread.rows[0]) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return", null);

          case 5:
            if (!thread.rows[0].slug) delete thread.rows[0].slug;
            return _context5.abrupt("return", thread.rows[0]);

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function GET_EXISTING(_x6) {
    return _ref7.apply(this, arguments);
  };
}();

var GET_POSTS = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(slug, query) {
    var client, threadId, LIMIT, ORDER_TYPE, SINCE, _SINCE, _posts, _SINCE2, path, _posts2, _SINCE3, _path, _posts3, SINCE2, posts;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _index["default"].connect();

          case 2:
            client = _context6.sent;
            _context6.prev = 3;
            _context6.next = 6;
            return client.query('BEGIN');

          case 6:
            _context6.next = 8;
            return client.query("\n        SELECT id FROM thread\n        WHERE ".concat(isNaN(slug) ? 'LOWER(slug)' : 'id', "=").concat(isNaN(slug) ? 'LOWER($1)' : '$1'), [slug]);

          case 8:
            threadId = _context6.sent.rows[0].id;

            if (threadId) {
              _context6.next = 13;
              break;
            }

            _context6.next = 12;
            return client.query('ROLLBACK');

          case 12:
            return _context6.abrupt("return", null);

          case 13:
            LIMIT = Number(query.limit) ? "LIMIT ".concat(Number(query.limit)) : 'LIMIT 100';
            ORDER_TYPE = query.desc === 'true' ? 'DESC' : query.desc === 'false' ? 'ASC' : '';
            SINCE = Number(query.since) ? "AND post.id > ".concat(query.since) : '';

            if (!(query.sort === 'flat')) {
              _context6.next = 24;
              break;
            }

            _SINCE = Number(query.since) ? "AND post.id ".concat(ORDER_TYPE === 'DESC' ? '<' : '>', " ").concat(query.since) : ''; //  parent, author, message, forum, thread, created,

            _context6.next = 20;
            return client.query("\n        SELECT id, parent, author, message, forum, thread, created\n        FROM post WHERE thread=$1 ".concat(_SINCE, "\n        ORDER BY created ").concat(ORDER_TYPE, ", id ").concat(ORDER_TYPE, " ").concat(LIMIT, "\n      "), [threadId]);

          case 20:
            _posts = _context6.sent;
            _context6.next = 23;
            return client.query('COMMIT');

          case 23:
            return _context6.abrupt("return", _posts.rows);

          case 24:
            if (!(query.sort === 'tree')) {
              _context6.next = 37;
              break;
            }

            _SINCE2 = '';

            if (!query.since) {
              _context6.next = 31;
              break;
            }

            _context6.next = 29;
            return client.query("\n      SELECT path FROM post WHERE id=$1", [query.since]);

          case 29:
            path = _context6.sent.rows[0].path;
            _SINCE2 = "AND path ".concat(ORDER_TYPE === 'DESC' ? '<' : '>', " '").concat(path, "'");

          case 31:
            _context6.next = 33;
            return client.query("\n      SELECT id, parent, author, message, forum, thread, created FROM post\n      WHERE thread=$1 ".concat(_SINCE2, "\n    ORDER BY path ").concat(ORDER_TYPE, " ").concat(LIMIT, "\n      "), [threadId]);

          case 33:
            _posts2 = _context6.sent;
            _context6.next = 36;
            return client.query('COMMIT');

          case 36:
            return _context6.abrupt("return", _posts2.rows);

          case 37:
            if (!(query.sort === 'parent_tree')) {
              _context6.next = 50;
              break;
            }

            _SINCE3 = '';

            if (!query.since) {
              _context6.next = 44;
              break;
            }

            _context6.next = 42;
            return client.query("\n      SELECT path FROM post WHERE id=$1", [query.since]);

          case 42:
            _path = _context6.sent.rows[0].path;
            _SINCE3 = "AND post.path ".concat(ORDER_TYPE === 'DESC' ? '<' : '>', " '").concat(_path.split('.')[0], "'");

          case 44:
            _context6.next = 46;
            return client.query("\n        WITH tree AS (\n        SELECT subpath(path, 0, 1) as st FROM post\n        WHERE thread=$1 AND parent = 0 ".concat(_SINCE3, "\n        ORDER BY path ").concat(ORDER_TYPE, " ").concat(LIMIT, "\n        )\n      SELECT post.id, post.parent, post.author,\n      post.message, post.forum, post.thread, post.created FROM tree\n      JOIN post ON tree.st = subpath(post.path, 0, 1)\n      ORDER BY st ").concat(ORDER_TYPE, ", post.path ASC\n      "), [threadId]);

          case 46:
            _posts3 = _context6.sent;
            _context6.next = 49;
            return client.query('COMMIT');

          case 49:
            return _context6.abrupt("return", _posts3.rows);

          case 50:
            // const SINCE2 = Number(query.since) ? `AND post.id > ${query.since}` : ''
            SINCE2 = Number(query.since) ? "AND post.id ".concat(ORDER_TYPE === 'DESC' ? '<' : '>', " ").concat(query.since) : '';
            _context6.next = 53;
            return client.query("\n        SELECT id, parent, author, message, forum, thread, created\n        FROM post WHERE thread=$1 ".concat(SINCE2, "\n        ORDER BY id ").concat(ORDER_TYPE, " ").concat(LIMIT), [threadId]);

          case 53:
            posts = _context6.sent;
            _context6.next = 56;
            return client.query('COMMIT');

          case 56:
            return _context6.abrupt("return", posts.rows);

          case 59:
            _context6.prev = 59;
            _context6.t0 = _context6["catch"](3);
            _context6.next = 63;
            return client.query('ROLLBACK');

          case 63:
            throw _context6.t0;

          case 64:
            _context6.prev = 64;
            client.release();
            return _context6.finish(64);

          case 67:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[3, 59, 64, 67]]);
  }));

  return function GET_POSTS(_x7, _x8) {
    return _ref8.apply(this, arguments);
  };
}();

var CREATE_VOTE = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(_ref9, slug) {
    var nickname, voice, client, createdVote, _createdVote$rows$, thread_id, user, thread;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            nickname = _ref9.nickname, voice = _ref9.voice;
            _context7.next = 3;
            return _index["default"].connect();

          case 3:
            client = _context7.sent;
            _context7.prev = 4;
            _context7.next = 7;
            return client.query('BEGIN');

          case 7:
            _context7.next = 9;
            return client.query((0, _queries.CREATE_VOTE_QUERY)(slug), [nickname, voice, slug]);

          case 9:
            createdVote = _context7.sent;

            if (createdVote.rows.length) {
              _context7.next = 12;
              break;
            }

            throw new Error('User or thread not found');

          case 12:
            _createdVote$rows$ = createdVote.rows[0], thread_id = _createdVote$rows$.thread_id, user = _createdVote$rows$.user;

            if (!(createdVote.rows[0].id === 100000)) {
              _context7.next = 23;
              break;
            }

            _context7.next = 16;
            return sleep(1000);

          case 16:
            _context7.next = 18;
            return client.query("UPDATE thread SET (votes, votes_updated) = (SELECT SUM(voice), TRUE FROM vote WHERE vote.thread_id=thread.id)");

          case 18:
            _context7.next = 20;
            return client.query((0, _queries.GET_QUERY)(thread_id), [thread_id]);

          case 20:
            thread = _context7.sent;
            _context7.next = 26;
            break;

          case 23:
            _context7.next = 25;
            return client.query(_queries.FAKE_UPDATE_VOTES_GET_THREAD_QUERY, [thread_id]);

          case 25:
            thread = _context7.sent;

          case 26:
            _context7.next = 28;
            return client.query('COMMIT');

          case 28:
            return _context7.abrupt("return", thread.rows[0]);

          case 31:
            _context7.prev = 31;
            _context7.t0 = _context7["catch"](4);
            console.log(_context7.t0);
            _context7.next = 36;
            return client.query('ROLLBACK');

          case 36:
            throw _context7.t0;

          case 37:
            _context7.prev = 37;
            client.release();
            return _context7.finish(37);

          case 40:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[4, 31, 37, 40]]);
  }));

  return function CREATE_VOTE(_x9, _x10) {
    return _ref10.apply(this, arguments);
  };
}();

var THREAD_MODEL = {
  GET_EXISTING: GET_EXISTING,
  CREATE: CREATE,
  CREATE_VOTE: CREATE_VOTE,
  UPDATE: UPDATE,
  GET: GET,
  GET_POSTS: GET_POSTS,
  valid: valid,
  validAny: validAny
};
exports.THREAD_MODEL = THREAD_MODEL;
var _default = THREAD_MODEL;
exports["default"] = _default;