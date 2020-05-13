"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _user = _interopRequireDefault(require("../../models/user"));

var _thread = _interopRequireDefault(require("../../models/thread"));

var _vote = _interopRequireDefault(require("../../models/vote"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var thread;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_vote["default"].valid(req.body)) {
              _context.next = 13;
              break;
            }

            _context.prev = 1;
            _context.next = 4;
            return _thread["default"].CREATE_VOTE(req.body, req.params.slug);

          case 4:
            thread = _context.sent;
            res.status(200).send(thread);
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            res.status(404).send({
              message: 'Не удалось проголосовать'
            });

          case 11:
            _context.next = 14;
            break;

          case 13:
            res.status(400).send({
              message: "\n    \u0413\u043E\u043B\u043E\u0441 \u0438\u043C\u0435\u0435\u0442 \u043F\u043E\u043B\u044F\n    nickname: string\n    voice number\n    "
            });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 8]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;