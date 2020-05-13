"use strict";

require("babel-polyfill");

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _morgan = _interopRequireDefault(require("morgan"));

var _user = _interopRequireDefault(require("./api/routes/user"));

var _forum = _interopRequireDefault(require("./api/routes/forum"));

var _post = _interopRequireDefault(require("./api/routes/post"));

var _service = _interopRequireDefault(require("./api/routes/service"));

var _thread = _interopRequireDefault(require("./api/routes/thread"));

require("./api/models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var app = (0, _express["default"])();
app.use((0, _morgan["default"])('dev'));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use('/api/user/', _user["default"]);
app.use('/api/forum/', _forum["default"]);
app.use('/api/post/', _post["default"]);
app.use('/api/service/', _service["default"]);
app.use('/api/thread/', _thread["default"]);
app.use(function (req, res) {
  res.write('Success');
  res.send();
});
app.listen(process.env.HTTP_PORT);