"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _user = require("../../controllers/user");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.get('/:nickname/profile', _user.getProfile);
router.post('/:nickname/profile', _user.changeProfile);
router.post('/:nickname/create', _user.createProfile);
var _default = router;
exports["default"] = _default;