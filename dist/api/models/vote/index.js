"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VOTE_MODEL = void 0;

var valid = function valid(user) {
  try {
    var nickname = user.nickname,
        voice = user.voice;
    if (typeof nickname !== 'string') return false;
    if (typeof voice !== 'number') return false;
  } catch (e) {
    return false;
  }

  return true;
};

var VOTE_MODEL = {
  valid: valid
};
exports.VOTE_MODEL = VOTE_MODEL;
var _default = VOTE_MODEL;
exports["default"] = _default;