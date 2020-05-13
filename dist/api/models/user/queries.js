"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_QUERY = exports.GET_QUERY = exports.GET_EXISTING_QUERY = exports.CREATE_QUERY = void 0;
var CREATE_QUERY = "INSERT INTO users(nickname, fullname, email, about)\nVALUES ($1, $2, $3, $4)\nRETURNING nickname, fullname, email, about";
exports.CREATE_QUERY = CREATE_QUERY;
var GET_EXISTING_QUERY = "SELECT nickname, fullname, email, about\nFROM users\nWHERE LOWER(nickname)=LOWER($1) OR LOWER(email)=LOWER($2)\nLIMIT 2";
exports.GET_EXISTING_QUERY = GET_EXISTING_QUERY;
var GET_QUERY = "SELECT nickname, fullname, email, about\nFROM users\nWHERE LOWER(nickname)=LOWER($1)\nLIMIT 1";
exports.GET_QUERY = GET_QUERY;

var UPDATE_QUERY = function UPDATE_QUERY(fields, nicknameArg) {
  return "UPDATE users\nSET ".concat(fields, "\nWHERE LOWER(nickname)=LOWER($").concat(nicknameArg, ")\nRETURNING nickname, fullname, email, about");
};

exports.UPDATE_QUERY = UPDATE_QUERY;