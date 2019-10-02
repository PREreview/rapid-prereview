"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _getBundlePaths = _interopRequireDefault(require("../utils/get-bundle-paths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express.Router({
  caseSensitive: true
});
router.get('/:doi?', function (req, res, next) {
  (0, _getBundlePaths.default)(function (err, bundles) {
    if (err) return next(err);
    res.render('index', {
      bundles: bundles
    });
  });
});
var _default = router;
exports.default = _default;