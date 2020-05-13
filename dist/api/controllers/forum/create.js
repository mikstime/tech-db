"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _forum2 = _interopRequireDefault(require("../../models/forum"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var forum, _forum;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_forum2["default"].valid(req.body)) {
              _context.next = 22;
              break;
            }

            _context.prev = 1;
            _context.next = 4;
            return _forum2["default"].CREATE(req.body);

          case 4:
            forum = _context.sent;

            if (!forum) {
              res.status(404).send({
                message: 'User not found'
              });
            } else {
              res.status(201).send(forum);
            }

            _context.next = 20;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            _context.prev = 10;
            _context.next = 13;
            return _forum2["default"].GET_EXISTING(req.body.slug);

          case 13:
            _forum = _context.sent;
            res.status(409).send(_forum);
            _context.next = 20;
            break;

          case 17:
            _context.prev = 17;
            _context.t1 = _context["catch"](10);
            //forum does not exists, user exists, not created (something wrong)
            res.status(500).send({
              message: 'Unable to create forum'
            });

          case 20:
            _context.next = 23;
            break;

          case 22:
            res.status(400).send({
              message: 'Форум имеет поля ' + 'title: string ' + 'user: string ' + 'slug: string'
            });

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 8], [10, 17]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;