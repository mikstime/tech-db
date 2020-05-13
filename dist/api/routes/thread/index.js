"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _thread = require("../../controllers/thread");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.post('/:slug/create/', _thread.create);
router.get('/:slug/details', _thread.details);
router.post('/:slug/details', _thread.change);
router.get('/:slug/posts', _thread.posts);
router.post('/:slug/vote', _thread.vote);
var _default = router;
exports["default"] = _default;