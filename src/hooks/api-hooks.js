import { useState, useEffect, useRef, useCallback } from 'react';
import noop from 'lodash/noop';
import { createError } from '../utils/errors';
import { unprefix, getId, arrayify } from '../utils/jsonld';
import { createPreprintId } from '../utils/ids';
import { useStores } from '../contexts/store-context';
import { useUser } from '../contexts/user-context';

const DEFAULT_SEARCH_RESULTS = {
  bookmark: null,
  rows: [],
  total_rows: 0,
  counts: {}
};

/**
 * Use to POST an Action to the API and keep track of the request progress /
 * error
 */
export function usePostAction() {
  const [, setUser] = useUser();

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

  const {
    preprintsWithActionsStore,
    preprintsSearchResultsStore,
    newPreprintsStore,
    roleStore
  } = useStores();

  // Note: `onSuccess` and `onError` are only called if the component is still
  // mounted
  const post = useCallback(
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

      fetch(`${process.env.API_URL}/api/action`, {
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
          preprintsWithActionsStore.upsertAction(body);
          preprintsSearchResultsStore.upsertAction(body);
          newPreprintsStore.upsertAction(body);
          roleStore.setFromAction(body);

          if (
            body['@type'] === 'UpdateUserAction' ||
            body['@type'] === 'UpdateContactPointAction' ||
            body['@type'] === 'VerifyContactPointAction' ||
            body['@type'] === 'CreateApiKeyAction'
          ) {
            setUser(body.result);
          } else if (body['@type'] === 'ModerateRapidPREreviewAction') {
            preprintsSearchResultsStore.reset();
          }

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
    },
    [
      preprintsWithActionsStore,
      preprintsSearchResultsStore,
      newPreprintsStore,
      roleStore,
      setUser
    ]
  );

  const resetPostState = useCallback(function resetPostState() {
    setState({
      isActive: false,
      error: null,
      body: null
    });
  }, []);

  return [post, state, resetPostState];
}

/**
 * Get Preprint metadata from `identifier`
 */
export function usePreprint(
  identifier, // arXivId or DOI
  prefetchedPreprint,
  fallbackUrl // a URL to use in case `identifier` hasn't been registered with the DOI service yet (e.g., crossref)
) {
  identifier = unprefix(identifier);

  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [preprint, setPreprint] = useState(null);

  const { preprintsWithActionsStore } = useStores();

  useEffect(() => {
    if (identifier) {
      let cached;
      if (
        prefetchedPreprint &&
        unprefix(prefetchedPreprint.doi || prefetchedPreprint.arXivId) ===
          identifier
      ) {
        cached = prefetchedPreprint;
      } else if (preprintsWithActionsStore.has(identifier)) {
        cached = preprintsWithActionsStore.get(identifier, { actions: false });
      }

      if (cached) {
        setProgress({
          isActive: false,
          error: null
        });
        setPreprint(cached);
      } else {
        setProgress({
          isActive: true,
          error: null
        });
        setPreprint(null);

        const controller = new AbortController();

        fetch(
          `${process.env.API_URL}/api/resolve?identifier=${encodeURIComponent(
            identifier
          )}${fallbackUrl ? `&url=${encodeURIComponent(fallbackUrl)}` : ''}`,
          {
            signal: controller.signal
          }
        )
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
            preprintsWithActionsStore.set(data, {
              onlyIfNotExisting: true,
              emit: false
            });
            setPreprint(data);
            setProgress({ isActive: false, error: null });
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              setProgress({ isActive: false, error: err });
              setPreprint(null);
            }
          });

        return () => {
          controller.abort();
        };
      }
    } else {
      setProgress({
        isActive: false,
        error: null
      });
      setPreprint(null);
    }
  }, [identifier, fallbackUrl, prefetchedPreprint, preprintsWithActionsStore]);

  return [preprint, progress];
}

/**
 * Get all the `RapidPREreviewAction` and `RequestForRapidPREreviewAction`
 * associated with a preprint
 */
export function usePreprintActions(identifier) {
  const { preprintsWithActionsStore } = useStores();

  const [progress, setProgress] = useState({
    isActive: true,
    error: null
  });

  const [actions, setActions] = useState(
    identifier ? preprintsWithActionsStore.getActions(identifier) : []
  );

  useEffect(() => {
    // keep `actions` up-to-date
    function update(preprint) {
      if (createPreprintId(preprint) === createPreprintId(identifier)) {
        setActions(arrayify(preprint.potentialAction));
      }
    }

    preprintsWithActionsStore.addListener('SET', update);

    return () => {
      preprintsWithActionsStore.removeListener('SET', update);
    };
  }, [identifier, preprintsWithActionsStore]);

  useEffect(() => {
    if (identifier) {
      setProgress({
        isActive: true,
        error: null
      });
      setActions(preprintsWithActionsStore.getActions(identifier));

      const controller = new AbortController();

      fetch(
        `${process.env.API_URL}/api/preprint/${unprefix(
          createPreprintId(identifier)
        )}`,
        {
          signal: controller.signal
        }
      )
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
          preprintsWithActionsStore.set(data);
          setActions(arrayify(data.potentialAction));
          setProgress({ isActive: false, error: null });
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setProgress({ isActive: false, error: err });
            setActions([]);
          }
        });

      return () => {
        controller.abort();
      };
    } else {
      setProgress({
        isActive: false,
        error: null
      });
      setActions([]);
    }
  }, [identifier, preprintsWithActionsStore]);

  console.log('actions: ', actions);

  return [actions, progress];
}

/**
 * Search preprints with reviews or request for reviews
 */
export function usePreprintSearchResults(
  search // the ?qs part of the url
) {
  const {
    preprintsWithActionsStore,
    preprintsSearchResultsStore
  } = useStores();

  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [results, setResults] = useState(
    preprintsSearchResultsStore.get(search) || DEFAULT_SEARCH_RESULTS
  );

  useEffect(() => {
    // keep `results` up-to-date
    function update(preprint) {
      if (
        arrayify(results.rows).some(row => getId(row.doc) === getId(preprint))
      ) {
        setResults(prevResults => {
          return Object.assign({}, prevResults, {
            rows: arrayify(prevResults.rows).map(row => {
              if (!row.doc || getId(row.doc) !== getId(preprint)) {
                return row;
              }
              return Object.assign({}, row, { doc: preprint });
            })
          });
        });
      }
    }

    preprintsWithActionsStore.addListener('SET', update);

    return () => {
      preprintsWithActionsStore.removeListener('SET', update);
    };
  }, [results, preprintsWithActionsStore]);

  useEffect(() => {
    if (preprintsSearchResultsStore.has(search)) {
      setProgress({
        isActive: false,
        error: null
      });
      setResults(preprintsSearchResultsStore.get(search));
    } else {
      setProgress({
        isActive: true,
        error: null
      });
      setResults(DEFAULT_SEARCH_RESULTS);

      const controller = new AbortController();

      fetch(`${process.env.API_URL}/api/preprint/${search}`, {
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
          data.search = search;

          arrayify(data.rows).forEach(row => {
            if (row.doc) {
              preprintsWithActionsStore.set(row.doc, { emit: false });
            }
          });

          preprintsSearchResultsStore.set(search, data);

          setResults(data);
          setProgress({ isActive: false, error: null });
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setProgress({ isActive: false, error: err });
            setResults(DEFAULT_SEARCH_RESULTS);
          }
        });

      return () => {
        controller.abort();
      };
    }
  }, [search, preprintsWithActionsStore, preprintsSearchResultsStore]);

  return [results, progress];
}

/**
 * Get a Role
 */
export function useRole(roleId) {
  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const { roleStore } = useStores();
  const [role, setRole] = useState(roleStore.get(roleId));

  useEffect(() => {
    // keep `role` up-to-date
    function update(role) {
      if (getId(role) === getId(roleId)) {
        setRole(role);
      }
    }

    roleStore.addListener('SET', update);

    return () => {
      roleStore.removeListener('SET', update);
    };
  }, [roleId, roleStore]);

  useEffect(() => {
    if (roleId) {
      const cached = roleStore.get(roleId);
      if (cached) {
        setProgress({
          isActive: false,
          error: null
        });
        setRole(cached);
      } else {
        setProgress({
          isActive: true,
          error: null
        });
        setRole(null);

        const controller = new AbortController();

        fetch(`${process.env.API_URL}/api/role/${unprefix(roleId)}`, {
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
            roleStore.set(data);
            setRole(data);
            setProgress({ isActive: false, error: null });
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              setProgress({ isActive: false, error: err });
              setRole(null);
            }
          });

        return () => {
          controller.abort();
        };
      }
    } else {
      setProgress({
        isActive: false,
        error: null
      });
      setRole(null);
    }
  }, [roleId, roleStore]);

  return [role, progress];
}

/*
 * Get user roles (all or nothing)
 */
export function useUserRoles(user) {
  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const { roleStore } = useStores();
  const [roles, setRoles] = useState(roleStore.getUserRoles(user) || null);

  useEffect(() => {
    // keep `role` up-to-date
    function update(role) {
      if (roles && user.hasRole.some(roleId => roleId === getId(role))) {
        setRoles(prevRoles => {
          return prevRoles.map(_role => {
            return getId(_role) === getId(role) ? role : _role;
          });
        });
      }
    }

    roleStore.addListener('SET', update);

    return () => {
      roleStore.removeListener('SET', update);
    };
  }, [user, roleStore, roles]);

  useEffect(() => {
    const cached = roleStore.getUserRoles(user);
    if (cached) {
      setProgress({
        isActive: false,
        error: null
      });
      setRoles(cached);
    } else {
      setProgress({
        isActive: true,
        error: null
      });
      setRoles(null);

      const controllers = [];

      Promise.all(
        user.hasRole.map(roleId => {
          if (roleStore.has(roleId)) {
            return Promise.resolve(roleStore.get(roleId));
          }

          const controller = new AbortController();
          controllers.push(controller);

          return fetch(`${process.env.API_URL}/api/role/${unprefix(roleId)}`, {
            signal: controller.signal
          })
            .then(resp => {
              if (resp.ok) {
                return resp.json();
              } else {
                return resp.json().then(
                  body => {
                    throw createError(
                      resp.status,
                      body.description || body.name
                    );
                  },
                  err => {
                    throw createError(resp.status, 'something went wrong');
                  }
                );
              }
            })
            .then(data => {
              roleStore.set(data);
              return data;
            })
            .catch(err => {
              if (err.name !== 'AbortError') {
                throw err;
              }
            });
        })
      )
        .then(roles => {
          setProgress({
            isActive: false,
            error: null
          });
          setRoles(roles);
        })
        .catch(err => {
          setProgress({ isActive: false, error: err });
          setRoles(null);
        });

      return () => {
        controllers.forEach(controller => {
          controller.abort();
        });
      };
    }
  }, [user, roleStore]);

  return [roles, progress];
}

/**
 * Search using the `actions` index
 */
export function useActionsSearchResults(
  search, // the ?qs part of the url
  append = false
) {
  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [results, setResults] = useState(DEFAULT_SEARCH_RESULTS);

  useEffect(() => {
    setProgress({
      isActive: true,
      error: null
    });
    if (!append) {
      setResults(DEFAULT_SEARCH_RESULTS);
    }

    const controller = new AbortController();

    fetch(`${process.env.API_URL}/api/action/${search}`, {
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
        if (append) {
          setResults(prevResults => {
            return Object.assign(data, {
              rows: prevResults.rows.concat(data.rows)
            });
          });
        } else {
          setResults(data);
        }

        setProgress({ isActive: false, error: null });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setProgress({ isActive: false, error: err });
          setResults(DEFAULT_SEARCH_RESULTS);
        }
      });

    return () => {
      controller.abort();
    };
  }, [search, append]);

  return [results, progress, append];
}

/**
 * Search using the `roles` index
 */
export function useRolesSearchResults(
  search, // the ?qs part of the url
  append = false
) {
  const [progress, setProgress] = useState({
    isActive: false,
    error: null
  });

  const [results, setResults] = useState(DEFAULT_SEARCH_RESULTS);

  useEffect(() => {
    setProgress({
      isActive: true,
      error: null
    });
    if (!append) {
      setResults(DEFAULT_SEARCH_RESULTS);
    }

    const controller = new AbortController();

    fetch(`${process.env.API_URL}/api/role/${search}`, {
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
        if (append) {
          setResults(prevResults => {
            return Object.assign(data, {
              rows: prevResults.rows.concat(data.rows)
            });
          });
        } else {
          setResults(data);
        }

        setProgress({ isActive: false, error: null });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setProgress({ isActive: false, error: err });
          setResults(DEFAULT_SEARCH_RESULTS);
        }
      });

    return () => {
      controller.abort();
    };
  }, [search, append]);

  return [results, progress, append];
}
