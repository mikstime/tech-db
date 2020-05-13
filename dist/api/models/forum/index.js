"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.FORUM_MODEL = void 0;

var _index = _interopRequireDefault(require("../index"));

var _queries = require("./queries");

var _queries2 = require("../thread/queries");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//@TODO денормализовать форум: увеличивать счетчик постов и веток при создании
// и отдавать их - автоматическое избавление от запросов длительностью 70+сек
var valid = function valid(forum) {
  try {
    var title = forum.title,
        user = forum.user,
        slug = forum.slug;
    if (typeof title !== 'string') return false;
    if (typeof user !== 'string') return false;
    if (typeof slug !== 'string') return false;
  } catch (e) {
    return false;
  }

  return true;
};

var validAny = function validAny(forum) {
  if ('title' in forum && typeof forum.title !== 'string') return false;
  if ('user' in forum && typeof forum.user !== 'string') return false;
  if ('slug' in forum && typeof forum.slug !== 'string') return false;
  return true;
};

var CREATE = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
    var user, title, slug, forum;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            user = _ref.user, title = _ref.title, slug = _ref.slug;
            _context.next = 3;
            return _index["default"].query(_queries.CREATE_QUERY, [user, title, slug]);

          case 3:
            forum = _context.sent;
            return _context.abrupt("return", forum.rows[0]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function CREATE(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var GET_EXISTING = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(slug) {
    var forum;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _index["default"].query(_queries.GET_EXISTING_QUERY, [slug]);

          case 2:
            forum = _context2.sent;
            return _context2.abrupt("return", forum.rows[0]);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function GET_EXISTING(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var GET = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(slug) {
    var forum;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _index["default"].query(_queries.GET_QUERY, [slug]);

          case 2:
            forum = _context3.sent;

            if (forum.rows.length) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return", undefined);

          case 5:
            if (forum.rows[0].threads_updated) {
              _context3.next = 9;
              break;
            }

            _context3.next = 8;
            return _index["default"].query(_queries2.UPDATE_THREADS_GET_FORUM_QUERY, [slug]);

          case 8:
            forum = _context3.sent;

          case 9:
            delete forum.rows[0].threads_updated;
            forum.rows[0].threads = Number(forum.rows[0].threads);
            forum.rows[0].posts = Number(forum.rows[0].posts);
            return _context3.abrupt("return", forum.rows[0]);

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function GET(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

var GET_USERS = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(slug, query) {
    var args, users;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            args = [slug];
            if (query.since) args.push(query.since);
            _context4.prev = 2;
            _context4.next = 5;
            return _index["default"].query((0, _queries.GET_USERS_QUERY)(query), args);

          case 5:
            users = _context4.sent;
            return _context4.abrupt("return", users.rows);

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4["catch"](2);
            console.log(_context4.t0);
            throw _context4.t0;

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 9]]);
  }));

  return function GET_USERS(_x4, _x5) {
    return _ref5.apply(this, arguments);
  };
}();

var GET_THREADS = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(slug, query) {
    var args, options, argSince, threads;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            args = [slug];
            options = '';
            options += "ORDER BY created ".concat(query.desc === 'true' ? 'DESC' : '', " ");

            if (query.limit) {
              args.push(query.limit);
              options += "LIMIT $".concat(args.length, " ");
            } else {
              args.push(100);
              options += "LIMIT $".concat(args.length, " ");
            }

            if (query.since) {
              args.push(query.since);
              argSince = args.length;
            }

            _context5.next = 8;
            return _index["default"].query("\n        SELECT id, title, author, forum, message, slug, created, votes, posts\n        FROM thread\n        WHERE LOWER(forum) = LOWER($1) ".concat(argSince ? "AND created ".concat(query.desc === 'true' ? '<=' : '>=', " $").concat(argSince) : '', "\n        ").concat(options), args);

          case 8:
            threads = _context5.sent;
            threads.rows.forEach(function (t) {
              t.slug ? t : delete t.slug;
              t.created ? t : delete t.created;
            });
            return _context5.abrupt("return", threads.rows);

          case 13:
            _context5.prev = 13;
            _context5.t0 = _context5["catch"](0);
            console.log(_context5.t0);
            throw _context5.t0;

          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 13]]);
  }));

  return function GET_THREADS(_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
}();

var FORUM_MODEL = {
  CREATE: CREATE,
  GET: GET,
  GET_EXISTING: GET_EXISTING,
  GET_USERS: GET_USERS,
  GET_THREADS: GET_THREADS,
  valid: valid,
  validAny: validAny
};
exports.FORUM_MODEL = FORUM_MODEL;
var _default = FORUM_MODEL;
exports["default"] = _default;