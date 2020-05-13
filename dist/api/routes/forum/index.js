"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _forum = require("../../controllers/forum");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.post('/create', _forum.create);
router.get('/:slug/details', _forum.details);
router.post('/:slug/create', _forum.createSub);
router.get('/:slug/users', _forum.getUsers);
router.get('/:slug/threads', _forum.getThreads);
var _default = router;
exports["default"] = _default;