"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.USER_MODEL = void 0;

var _index = _interopRequireDefault(require("../index"));

var _queries = require("./queries");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var valid = function valid(user) {
  try {
    var fullname = user.fullname,
        about = user.about,
        email = user.email;
    if (typeof fullname !== 'string') return false;
    if (typeof about !== 'string') return false;
    if (typeof email !== 'string') return false;
  } catch (e) {
    return false;
  }

  return true;
};

var validAny = function validAny(user) {
  if ('fullname' in user && typeof user.fullname !== 'string') return false;
  if ('about' in user && typeof user.about !== 'string') return false;
  if ('email' in user && typeof user.email !== 'string') return false;
  return true;
};

var CREATE = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref, nickname) {
    var fullname, about, email, user;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fullname = _ref.fullname, about = _ref.about, email = _ref.email;
            _context.prev = 1;
            _context.next = 4;
            return _index["default"].query(_queries.CREATE_QUERY, [nickname, fullname, email, about]);

          case 4:
            user = _context.sent;
            return _context.abrupt("return", user.rows[0]);

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            throw _context.t0;

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 8]]);
  }));

  return function CREATE(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var prepareFields = function prepareFields(fields) {
  return Object.entries(fields).reduce(function (acc, field) {
    if (field[1] !== undefined) {
      acc[0].push(field[1]);
      if (acc[1] !== '') acc[1] += ',';
      acc[1] += "".concat(field[0], "=$").concat(acc[0].length);
    }

    return acc;
  }, [[], '']);
};

var UPDATE = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref3, nickname) {
    var fullname, about, email, _prepareFields, _prepareFields2, args, fields, user;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            fullname = _ref3.fullname, about = _ref3.about, email = _ref3.email;
            _prepareFields = prepareFields({
              fullname: fullname,
              about: about,
              email: email
            }), _prepareFields2 = _slicedToArray(_prepareFields, 2), args = _prepareFields2[0], fields = _prepareFields2[1];
            args.push(nickname);

            if (!(args.length !== 1)) {
              _context2.next = 9;
              break;
            }

            _context2.next = 6;
            return _index["default"].query((0, _queries.UPDATE_QUERY)(fields, args.length), args);

          case 6:
            user = _context2.sent.rows[0];
            _context2.next = 12;
            break;

          case 9:
            _context2.next = 11;
            return _index["default"].query(_queries.GET_QUERY, [nickname]);

          case 11:
            user = _context2.sent.rows[0];

          case 12:
            return _context2.abrupt("return", user);

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function UPDATE(_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
}();

var GET = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(nickname) {
    var user;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _index["default"].query(_queries.GET_QUERY, [nickname]);

          case 2:
            user = _context3.sent;
            return _context3.abrupt("return", user.rows[0]);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function GET(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

var GET_EXISTING = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref6, nickname) {
    var email, user;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            email = _ref6.email;
            _context4.next = 3;
            return _index["default"].query(_queries.GET_EXISTING_QUERY, [nickname, email]);

          case 3:
            user = _context4.sent;

            if (user.rows.length) {
              _context4.next = 6;
              break;
            }

            throw new Error('Unable to get user by id or email');

          case 6:
            return _context4.abrupt("return", user.rows);

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function GET_EXISTING(_x6, _x7) {
    return _ref7.apply(this, arguments);
  };
}();

var USER_MODEL = {
  CREATE: CREATE,
  UPDATE: UPDATE,
  GET: GET,
  GET_EXISTING: GET_EXISTING,
  valid: valid,
  validAny: validAny
};
exports.USER_MODEL = USER_MODEL;
var _default = USER_MODEL;
exports["default"] = _default;