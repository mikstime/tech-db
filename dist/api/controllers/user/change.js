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
    var user;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_user["default"].validAny(req.body)) {
              _context.next = 17;
              break;
            }

            _context.prev = 1;
            _context.next = 4;
            return _user["default"].UPDATE(req.body, req.params.nickname);

          case 4:
            user = _context.sent;

            if (user) {
              _context.next = 8;
              break;
            }

            res.status(404).send({
              message: 'User does not exists'
            });
            return _context.abrupt("return");

          case 8:
            res.status(200).send(user);
            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](1);
            console.log(_context.t0);
            res.status(409).send({
              message: 'Email already exists'
            });

          case 15:
            _context.next = 18;
            break;

          case 17:
            res.status(400).send({
              message: 'Пользователь имеет поля ' + 'fullname: string ' + 'about: string ' + 'email: string'
            });

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 11]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;