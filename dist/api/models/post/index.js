"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.POST_MODEL = void 0;

var _index = _interopRequireDefault(require("../index"));

var _thread = _interopRequireDefault(require("../thread"));

var _forum = _interopRequireDefault(require("../forum"));

var _queries = require("../thread/queries");

var _queries2 = require("./queries");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var numTo12lenStr = function numTo12lenStr(num) {
  var s = num.toString();
  return '0'.repeat(12 - s.length) + s;
};

var valid = function valid(post) {
  try {
    var parent = post.parent,
        message = post.message;
    if (typeof parent !== 'number') return false;
    if (typeof message !== 'string') return false;
  } catch (e) {
    return false;
  }

  return true;
};

var validAny = function validAny(post) {
  if ('parent' in post && typeof post.parent !== 'number') return false;
  if ('message' in post && typeof post.message !== 'string') return false;
  return true;
};

var validList = function validList(posts) {
  try {
    var _iterator = _createForOfIteratorHelper(posts),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var post = _step.value;

        if ('parent' in post) {
          if (typeof post.parent !== 'number') return false;
        }

        if (typeof post.message !== 'string') return false;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } catch (e) {
    return false;
  }

  return true;
};

var validAnyList = function validAnyList(posts) {
  var _iterator2 = _createForOfIteratorHelper(posts),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var post = _step2.value;
      if ('parent' in post && typeof post.parent !== 'number') return false;
      if ('message' in post && typeof post.message !== 'string') return false;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return true;
};

var CREATE = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(posts, slug) {
    var client, thread, _thread$rows$, id, forum, l, _posts$reduce, _posts$reduce2, args, values, cposts;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _index["default"].connect();

          case 2:
            client = _context2.sent;
            _context2.prev = 3;
            _context2.next = 6;
            return client.query('BEGIN');

          case 6:
            _context2.next = 8;
            return client.query((0, _queries.GET_EXISTING_QUERY)(slug), [slug]);

          case 8:
            thread = _context2.sent;
            _thread$rows$ = thread.rows[0], id = _thread$rows$.id, forum = _thread$rows$.forum;

            if (id) {
              _context2.next = 13;
              break;
            }

            client.query('ROLLBACK');
            return _context2.abrupt("return", null);

          case 13:
            if (posts.length) {
              _context2.next = 17;
              break;
            }

            _context2.next = 16;
            return client.query('COMMIT');

          case 16:
            return _context2.abrupt("return", []);

          case 17:
            l = 0;
            _posts$reduce = posts.reduce(function (acc, p) {
              if (acc[0].length) acc[1] += ',';
              acc[0].push(p.parent || 0, p.author, p.message, forum, id);
              if (p.created) acc[0].push(p.created);
              acc[0].push('9.9');
              acc[1] += "($".concat(++l, ", $").concat(++l, ", $").concat(++l, ", $").concat(++l, ", $").concat(++l, ",").concat(p.created ? "$".concat(++l, ",") : 'NOW(),', " $").concat(++l, ")");
              return acc;
            }, [[], '']), _posts$reduce2 = _slicedToArray(_posts$reduce, 2), args = _posts$reduce2[0], values = _posts$reduce2[1];
            _context2.next = 21;
            return client.query((0, _queries2.CREATE_QUERY)(id, values), args);

          case 21:
            cposts = _context2.sent;
            _context2.next = 24;
            return Promise.all(cposts.rows.map( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(post, i) {
                var parentPath, parent, id, args, checked;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        parentPath = '';
                        parent = post.parent, id = post.id;
                        args = [post.author];
                        if (parent) args.push(parent);
                        _context.next = 6;
                        return _index["default"].query((0, _queries2.CHECK_AUTHORS_AND_PARENTS_QUERY)(post.parent), args);

                      case 6:
                        checked = _context.sent;

                        if (checked.rows.length) {
                          _context.next = 9;
                          break;
                        }

                        throw new Error('No parent or author');

                      case 9:
                        if (!(parent && checked.rows[0].thread !== thread.rows[0].id)) {
                          _context.next = 11;
                          break;
                        }

                        throw new Error('invalid parent');

                      case 11:
                        if (parent) {
                          _context.next = 17;
                          break;
                        }

                        delete post.parent;
                        _context.next = 15;
                        return client.query("\n            UPDATE post SET path ='".concat(numTo12lenStr(id), "' WHERE post.id=$1\n            "), [id]);

                      case 15:
                        _context.next = 19;
                        break;

                      case 17:
                        _context.next = 19;
                        return client.query("\n            UPDATE post SET path = '".concat(checked.rows[0].path + '.' + numTo12lenStr(id), "' WHERE post.id=$1\n           "), [id]);

                      case 19:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3, _x4) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 24:
            if (!(cposts.rows[cposts.rows.length - 1].id === 1500000)) {
              _context2.next = 38;
              break;
            }

            _context2.prev = 25;
            _context2.next = 28;
            return client.query("UPDATE forum SET posts = (SELECT COUNT(*) FROM post WHERE LOWER(post.forum)=LOWER(forum.slug))");

          case 28:
            _context2.next = 30;
            return client.query("UPDATE thread SET (posts, posts_updated) = (SELECT COUNT(*), TRUE FROM post WHERE post.thread=thread.id)");

          case 30:
            _context2.next = 36;
            break;

          case 32:
            _context2.prev = 32;
            _context2.t0 = _context2["catch"](25);
            throw _context2.t0;

          case 36:
            _context2.next = 42;
            break;

          case 38:
            _context2.next = 40;
            return client.query((0, _queries.UPDATE_FORUM_POST_COUNTER_QUERY)(posts.length), [forum]);

          case 40:
            _context2.next = 42;
            return client.query((0, _queries.UPDATE_THREAD_POST_COUNTER_QUERY)(posts.length), [id]);

          case 42:
            _context2.next = 44;
            return client.query('COMMIT');

          case 44:
            return _context2.abrupt("return", cposts.rows);

          case 47:
            _context2.prev = 47;
            _context2.t1 = _context2["catch"](3);
            _context2.next = 51;
            return client.query('ROLLBACK');

          case 51:
            throw _context2.t1;

          case 52:
            _context2.prev = 52;
            client.release();
            return _context2.finish(52);

          case 55:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 47, 52, 55], [25, 32]]);
  }));

  return function CREATE(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var UPDATE = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref3, id) {
    var message, client, post, postEdited;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            message = _ref3.message;
            _context3.next = 3;
            return _index["default"].connect();

          case 3:
            client = _context3.sent;
            _context3.prev = 4;
            _context3.next = 7;
            return client.query('BEGIN');

          case 7:
            _context3.next = 9;
            return _index["default"].query("\n    SELECT author, created, forum, id, message, thread\n    FROM post WHERE id=$1", [id]);

          case 9:
            post = _context3.sent;

            if (post.rows.length) {
              _context3.next = 14;
              break;
            }

            _context3.next = 13;
            return client.query('ROLLBACK');

          case 13:
            throw new Error('Post not found');

          case 14:
            if (!(!message && message !== '')) {
              _context3.next = 17;
              break;
            }

            post.rows[0].isEdited = false;
            return _context3.abrupt("return", post.rows[0]);

          case 17:
            _context3.next = 19;
            return _index["default"].query("\n  UPDATE post SET message = $1\n  WHERE id=$2\n  RETURNING author, created, forum, id, message, thread", [message, id]);

          case 19:
            postEdited = _context3.sent;

            if (!(post.rows[0].message !== postEdited.rows[0].message)) {
              _context3.next = 26;
              break;
            }

            postEdited.rows[0].isEdited = true;
            _context3.next = 24;
            return _index["default"].query("UPDATE post SET \"isEdited\"=TRUE WHERE id=$1", [id]);

          case 24:
            _context3.next = 27;
            break;

          case 26:
            postEdited.rows[0].isEdited = false;

          case 27:
            return _context3.abrupt("return", postEdited.rows[0]);

          case 30:
            _context3.prev = 30;
            _context3.t0 = _context3["catch"](4);
            _context3.next = 34;
            return client.query('ROLLBACK');

          case 34:
            throw _context3.t0;

          case 35:
            _context3.prev = 35;
            client.release();
            return _context3.finish(35);

          case 38:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[4, 30, 35, 38]]);
  }));

  return function UPDATE(_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

var GET = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(id, query) {
    var client, _query$related, _query$related2, _query$related3, result, post, thread, forum, user;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _index["default"].connect();

          case 2:
            client = _context4.sent;
            _context4.prev = 3;
            _context4.next = 6;
            return client.query('BEGIN');

          case 6:
            result = {};
            _context4.next = 9;
            return client.query("\n  SELECT author, created, parent, forum, id, message, thread, \"isEdited\"\n  FROM post WHERE id=$1", [id]);

          case 9:
            post = _context4.sent;

            if (post.rows.length) {
              _context4.next = 12;
              break;
            }

            throw new Error('Post not found');

          case 12:
            result.post = post.rows[0];
            if (!result.post.isEdited) delete result.post.isEdited;

            if (!((_query$related = query.related) === null || _query$related === void 0 ? void 0 : _query$related.includes('thread'))) {
              _context4.next = 21;
              break;
            }

            _context4.next = 17;
            return _thread["default"].GET(result.post.thread);

          case 17:
            thread = _context4.sent;

            if (thread) {
              _context4.next = 20;
              break;
            }

            throw new Error('Thread does not exist');

          case 20:
            result.thread = thread;

          case 21:
            if (!((_query$related2 = query.related) === null || _query$related2 === void 0 ? void 0 : _query$related2.includes('forum'))) {
              _context4.next = 28;
              break;
            }

            _context4.next = 24;
            return _forum["default"].GET(result.post.forum);

          case 24:
            forum = _context4.sent;

            if (forum) {
              _context4.next = 27;
              break;
            }

            throw new Error('Forum does not exist');

          case 27:
            result.forum = forum;

          case 28:
            if (!((_query$related3 = query.related) === null || _query$related3 === void 0 ? void 0 : _query$related3.includes('user'))) {
              _context4.next = 35;
              break;
            }

            _context4.next = 31;
            return client.query("\n      SELECT nickname, fullname, email, about\n      FROM users WHERE nickname=$1", [result.post.author]);

          case 31:
            user = _context4.sent;

            if (user.rows[0]) {
              _context4.next = 34;
              break;
            }

            throw new Error('User does not exist');

          case 34:
            result.author = user.rows[0];

          case 35:
            _context4.next = 37;
            return client.query('COMMIT');

          case 37:
            return _context4.abrupt("return", result);

          case 40:
            _context4.prev = 40;
            _context4.t0 = _context4["catch"](3);
            _context4.next = 44;
            return client.query('ROLLBACK');

          case 44:
            throw _context4.t0;

          case 45:
            _context4.prev = 45;
            client.release();
            return _context4.finish(45);

          case 48:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[3, 40, 45, 48]]);
  }));

  return function GET(_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}();

var prepareInsert = function prepareInsert(obj) {
  var keys = '';
  var args = [];
  var values = '';
  var input = Object.entries(obj);

  for (var i = 0; i < input.length - 1; i++) {
    if (input[i][1] !== undefined) {
      keys += input[i][0] + ',';
      args.push(input[i][1]);
      values += "$".concat(args.length, ",");
    }
  }

  if (input[input.length - 1][1] !== undefined) {
    keys += input[input.length - 1][0];
    args.push(input[input.length - 1][1]);
    values += "$".concat(args.length);
  } else {
    keys = keys.slice(0, -1);
    values = values.slice(0, -1);
  }

  return [args, keys, values];
};

var POST_MODEL = {
  validList: validList,
  validAnyList: validAnyList,
  CREATE: CREATE,
  UPDATE: UPDATE,
  GET: GET,
  valid: valid,
  validAny: validAny
};
exports.POST_MODEL = POST_MODEL;
var _default = POST_MODEL;
exports["default"] = _default;