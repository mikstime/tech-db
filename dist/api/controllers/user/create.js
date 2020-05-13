"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _user = _interopRequireDefault(require("../../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var user, existingUser;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_user["default"].valid(req.body)) {
              _context.next = 23;
              break;
            }

            _context.prev = 1;
            _context.next = 4;
            return _user["default"].CREATE(req.body, req.params.nickname);

          case 4:
            user = _context.sent;
            res.status(201).send(user);
            return _context.abrupt("return");

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](1);
            _context.prev = 11;
            _context.next = 14;
            return _user["default"].GET_EXISTING(req.body, req.params.nickname);

          case 14:
            existingUser = _context.sent;
            res.status(409).send(existingUser);
            _context.next = 21;
            break;

          case 18:
            _context.prev = 18;
            _context.t1 = _context["catch"](11);
            res.status(400).send({
              message: 'Incorrect input provided'
            });

          case 21:
            _context.next = 24;
            break;

          case 23:
            res.status(400).send({
              message: 'Пользователь имеет поля ' + 'fullname: string ' + 'about: string ' + 'email: string'
            });

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 9], [11, 18]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;