"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getBundlePaths;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var manifestPath = _path.default.resolve(__dirname, '../../public/assets/bundle-manifest.json');

var lastSeen = 0;
var cache = {};
var retries = 10;

function getBundlePaths(cb) {
  _fs.default.stat(manifestPath, function (err, info) {
    if (err) {
      if (err.code === 'ENOENT') {
        if (!retries) return cb(err);
        retries--;
        return setTimeout(function () {
          return getBundlePaths(cb);
        }, 5000);
      }

      return cb(err);
    } // !! info.mtime.getTime() can be 0 on AWS


    if (info.mtime.getTime() > lastSeen || info.birthtime.getTime() > lastSeen) {
      return _fs.default.readFile(manifestPath, 'utf8', function (err, data) {
        if (err) return cb(err);

        try {
          lastSeen = info.mtime.getTime();
          cache = JSON.parse(data);
        } catch (err) {
          return cb(err);
        }

        cb(null, cache);
      });
    }

    cb(null, cache);
  });
}