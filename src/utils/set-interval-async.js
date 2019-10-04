import noop from 'lodash/noop';

export function setIntervalAsync(f, delay, onError = noop, intervalId = {}) {
  f()
    .catch(err => {
      onError(err);
    })
    .then(() => {
      intervalId.timeoutId = setTimeout(() => {
        setIntervalAsync(f, delay, onError, intervalId);
      }, delay);
    });

  return intervalId;
}

export function clearIntervalAsync(intervalId) {
  clearTimeout(intervalId.timeoutId);
}
