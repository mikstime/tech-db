"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pool = exports["default"] = void 0;

var _pg = _interopRequireDefault(require("pg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Pool = _pg["default"].Pool;
exports.Pool = Pool;
var pool = new Pool();
var _default = pool;
exports["default"] = _default;