import { useState, useEffect, useRef } from 'react';
import { createError } from '../utils/errors';
import { unprefix, getId } from '../utils/jsonld';

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

/**
 * Get Preprint metadata from `identifier`
 */
export function usePreprint(identifier, prefetchedPreprint) {
  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [preprint, setPreprint] = useState(prefetchedPreprint || null);

  useEffect(() => {
    if (
      prefetchedPreprint &&
      unprefix(getId(prefetchedPreprint.doi || prefetchedPreprint.arXivId)) ===
        identifier
    ) {
      // noop
    } else if (identifier) {
      setProgress({
        isActive: true,
        error: null
      });
      setPreprint(null);

      const controller = new AbortController();

      fetch(`/api/resolve?identifier=${encodeURIComponent(identifier)}`, {
        signal: controller.signal
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
        .then(data => {
          setPreprint(data);
          setProgress({ isActive: false, error: null });
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setProgress({ isActive: false, error: err });
          }
          setPreprint(null);
        });

      return () => {
        setProgress({ isActive: false, error: null });
        setPreprint(null);
        controller.abort();
      };
    } else {
      setProgress({
        isActive: false,
        error: null
      });
      setPreprint(null);
    }
  }, [identifier, prefetchedPreprint]);

  return [preprint, progress];
}
