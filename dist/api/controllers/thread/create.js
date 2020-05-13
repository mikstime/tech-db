"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _post = _interopRequireDefault(require("../../models/post"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var posts;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_post["default"].validList(req.body)) {
              _context.next = 26;
              break;
            }

            _context.prev = 1;
            _context.prev = 2;
            _context.next = 5;
            return _post["default"].CREATE(req.body, req.params.slug);

          case 5:
            posts = _context.sent;

            if (posts) {
              _context.next = 9;
              break;
            }

            res.status(404).send({
              "message": "Can't find user with id #42\n"
            });
            return _context.abrupt("return");

          case 9:
            res.status(201).send(posts);
            _context.next = 19;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](2);
            console.log(_context.t0);

            if (!(_context.t0.message === 'invalid parent')) {
              _context.next = 18;
              break;
            }

            res.status(409).send({
              "message": "Can't find user with id #42\n"
            });
            return _context.abrupt("return");

          case 18:
            res.status(404).send({
              "message": "Can't find user with id #42\n"
            });

          case 19:
            _context.next = 24;
            break;

          case 21:
            _context.prev = 21;
            _context.t1 = _context["catch"](1);
            res.status(409).send({
              "message": "Can't find user with id #42\n"
            });

          case 24:
            _context.next = 27;
            break;

          case 26:
            res.status(400).send({
              message: "\n      \u041F\u043E\u0441\u0442 \u0438\u043C\u0435\u0435\u0442 \u043F\u043E\u043B\u044F\n      author: string\n      message: string\n      parent: int\n      "
            });

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 21], [2, 12]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;