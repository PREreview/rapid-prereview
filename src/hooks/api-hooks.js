import { useState, useEffect, useRef } from 'react';
import { createError } from '../utils/errors';

/**
 * Use to POST an Action to the API and keep track of the request progress /
 * error
 */
export function usePostAction() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [state, setState] = useState({
    isActive: false,
    error: null,
    body: null
  });

  function post(action) {
    if (isMounted.current) {
      setState({
        isActive: true,
        error: null,
        body: null
      });
    }

    fetch('/api/action', {
      method: 'POST',
      body: JSON.stringify(action),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        } else {
          return resp.json().then(
            body => {
              throw createError(resp.status, body.description || body.name);
            },
            err => {
              throw createError(resp.status, 'something went wrong');
            }
          );
        }
      })
      .then(body => {
        if (isMounted.current) {
          setState({ isActive: false, error: null, body });
        }
      })
      .catch(error => {
        if (isMounted.current) {
          setState({ isActive: false, error, body: null });
        }
      });
  }

  return [post, state];
}
