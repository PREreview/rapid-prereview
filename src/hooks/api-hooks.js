import { useState, useEffect, useRef } from 'react';
import noop from 'lodash/noop';
import { createError } from '../utils/errors';
import { unprefix, getId, arrayify } from '../utils/jsonld';
import { createPreprintId } from '../utils/ids';

// TODO stores directory each store inherit from EventEmitter and store object in LRU
// addListenner and removeListenner in useEffect

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

  const controllerRef = useRef(null);

  const [state, setState] = useState({
    isActive: false,
    error: null,
    body: null
  });

  // Note: `onSuccess` and `onError` are only called if the component is still
  // mounted
  function post(action, onSuccess = noop, onError = noop) {
    if (isMounted.current) {
      setState({
        isActive: true,
        error: null,
        body: action
      });
    }

    const controller = new AbortController();
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = controller;

    fetch('/api/action', {
      signal: controller.signal,
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
          onSuccess(body);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError' && isMounted.current) {
          setState({ isActive: false, error, body: action });
          onError(error);
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

/**
 * Get all the `RapidPREreviewAction` and `RequestForRapidPREreviewAction`
 * associated with a preprint
 */
export function usePreprintActions(identifier) {
  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (identifier) {
      setProgress({
        isActive: true,
        error: null
      });
      setActions([]);

      const controller = new AbortController();

      fetch(`/api/preprint/${unprefix(createPreprintId(identifier))}`, {
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
          setActions(arrayify(data.potentialAction));
          setProgress({ isActive: false, error: null });
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setProgress({ isActive: false, error: err });
          }
          setActions([]);
        });

      return () => {
        setProgress({ isActive: false, error: null });
        setActions([]);
        controller.abort();
      };
    } else {
      setProgress({
        isActive: false,
        error: null
      });
      setActions([]);
    }
  }, [identifier]);

  return [actions, progress];
}

const defaultResults = {
  bookmark: null,
  rows: [],
  total_rows: 0,
  counts: {}
};

/**
 * Get all the `RapidPREreviewAction` and `RequestForRapidPREreviewAction`
 * associated with a preprint
 */
export function usePreprintSearchResults(
  search // the ?qs part of the url
) {
  if (!search || search === '?') {
    search = `?q=*:*&sort=${JSON.stringify([
      '-score<number>',
      '-datePosted<number>'
    ])}&include_docs=true&counts=${JSON.stringify([
      'hasData',
      'hasCode',
      'hasReviews',
      'hasRequests',
      'subjectName'
    ])}`;
  }

  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [results, setResults] = useState(defaultResults);

  useEffect(() => {
    setProgress({
      isActive: true,
      error: null
    });
    setResults(defaultResults);

    const controller = new AbortController();

    fetch(`/api/preprint/${search}`, {
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
        setResults(data);
        setProgress({ isActive: false, error: null });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setProgress({ isActive: false, error: err });
        }
        setResults(defaultResults);
      });

    return () => {
      setProgress({ isActive: false, error: null });
      controller.abort();
    };
  }, [search]);

  return [results, progress];
}
