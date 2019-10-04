import assert from 'assert';
import {
  setIntervalAsync,
  clearIntervalAsync
} from '../src/utils/set-interval-async';

describe('setIntervalAsync', function() {
  this.timeout(4000);

  it('should work', done => {
    let i = 0;
    const intervalId = setIntervalAsync(() => {
      return new Promise(resolve =>
        setTimeout(() => {
          i++;
          resolve();
        }, 10)
      );
    }, 20);

    setTimeout(() => {
      assert(i >= 2);
      clearIntervalAsync(intervalId);
      done();
    }, 200);
  });

  it('should work with errors', done => {
    let i = 0;
    const intervalId = setIntervalAsync(() => {
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          i++;
          if (i % 2) {
            resolve();
          } else {
            reject(new Error('boom'));
          }
        }, 10)
      );
    }, 20);

    setTimeout(() => {
      assert(i >= 2);
      clearIntervalAsync(intervalId);
      done();
    }, 200);
  });
});
