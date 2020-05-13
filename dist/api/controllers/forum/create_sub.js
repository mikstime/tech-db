"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _thread2 = _interopRequireDefault(require("../../models/thread"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var thread, _thread;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_thread2["default"].valid(req.body)) {
              _context.next = 29;
              break;
            }

            _context.prev = 1;
            _context.next = 4;
            return _thread2["default"].CREATE(req.body, req.params.slug);

          case 4:
            thread = _context.sent;

            if (thread) {
              _context.next = 8;
              break;
            }

            res.status(404).send({
              message: 'User or forum was not found'
            });
            return _context.abrupt("return");

          case 8:
            res.status(201).send(thread);
            _context.next = 27;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](1);
            _context.prev = 13;
            _context.next = 16;
            return _thread2["default"].GET_EXISTING(req.body.slug);

          case 16:
            _thread = _context.sent;

            if (_thread) {
              _context.next = 20;
              break;
            }

            res.status(404).send({
              message: 'Forum or User not found'
            });
            return _context.abrupt("return");

          case 20:
            res.status(409).send(_thread);
            _context.next = 27;
            break;

          case 23:
            _context.prev = 23;
            _context.t1 = _context["catch"](13);
            console.log(_context.t1);
            res.status(500).send({
              message: 'Unable to create thread'
            });

          case 27:
            _context.next = 30;
            break;

          case 29:
            res.status(400).send({
              message: 'Ветка обсуждения имеет поля' + 'title: string ' + 'author: string ' + 'message: string ' + 'created string'
            });

          case 30:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 11], [13, 23]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;