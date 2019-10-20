import { useState } from 'react';

/**
 * This is used for the Rapid PREreview form:
 * Persists data for `key` in local storage and take care of reseting the value
 * when needed (if called with a different `roleId` or `preprintId`)
 */
export function useLocalState(key, roleId, preprintId, initialValue) {
  let value = localStorage.getItem(key);

  if (value) {
    try {
      value = JSON.parse(value);
      if (value.roleId === roleId && value.preprintId === preprintId) {
        initialValue = value.data;
      } else {
        localStorage.removeItem(key);
      }
    } catch (err) {
      localStorage.removeItem(key);
    }
  }

  const [state, setState] = useState(initialValue);

  function localSetState(value) {
    if (typeof value === 'function') {
      value = value(state);
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        data: value,
        roleId,
        preprintId
      })
    );
    setState(value);
  }

  return [state, localSetState];
}
