import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve(
  __dirname,
  '../../public/assets/bundle-manifest.json'
);

let lastSeen = 0;
let cache = {};
let retries = 10;

export default function getBundlePaths(cb) {
  fs.stat(manifestPath, (err, info) => {
    if (err) {
      if (err.code === 'ENOENT') {
        if (!retries) return cb(err);
        retries--;
        return setTimeout(() => getBundlePaths(cb), 5000);
      }
      return cb(err);
    }

    // !! info.mtime.getTime() can be 0 on AWS
    if (
      info.mtime.getTime() > lastSeen ||
      info.birthtime.getTime() > lastSeen
    ) {
      return fs.readFile(manifestPath, 'utf8', (err, data) => {
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
