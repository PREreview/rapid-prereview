import { useState, useEffect, useCallback, useRef } from 'react';
import { useStores } from '../contexts/store-context';

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

/**
 * Assess if the visitor lands on rapid PREreview for the first time
 */
export function useIsNewVisitor() {
  const [isNewVisitor] = useState(
    localStorage.getItem('isNewVisitor') !== 'false'
  );

  useEffect(() => {
    localStorage.setItem('isNewVisitor', 'false');
  }, []);

  return isNewVisitor;
}

export function useIsFirstTimeOnSettings() {
  const [isFirstTimeOnSettings] = useState(
    localStorage.getItem('isFirstTimeOnSettings') !== 'false'
  );

  useEffect(() => {
    localStorage.setItem('isFirstTimeOnSettings', 'false');
  }, []);

  return isFirstTimeOnSettings;
}

export function useHasAgreedCoC() {
  const [hasAgreed, setHasAgreed] = useState(
    localStorage.getItem('hasAgreedCoC') === 'true'
  );

  const localSet = useCallback(bool => {
    localStorage.setItem('hasAgreedCoC', bool.toString());
    setHasAgreed(bool);
  }, []);

  return [hasAgreed, localSet];
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 900px)').matches
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 900px)');

    function handleChange(e) {
      setIsMobile(e.matches);
    }

    mql.addListener(handleChange);

    return () => {
      mql.removeListener(handleChange);
    };
  }, []);

  return isMobile;
}

export function useNewPreprints() {
  const { preprintsSearchResultsStore, newPreprintsStore } = useStores();

  const [newPreprints, _setNewPreprints] = useState(newPreprintsStore.get());

  useEffect(() => {
    // keep `newPreprints` up-to-date
    function update(newPreprints) {
      _setNewPreprints(newPreprints);
    }

    newPreprintsStore.addListener('SET', update);

    return () => {
      newPreprintsStore.removeListener('SET', update);
    };
  }, [newPreprintsStore]);

  useEffect(() => {
    // reset newPreprint on search changes
    function reset() {
      _setNewPreprints([]);
    }

    preprintsSearchResultsStore.addListener('SET', reset);

    return () => {
      preprintsSearchResultsStore.removeListener('SET', reset);
    };
  }, [preprintsSearchResultsStore]);

  function setNewPreprints(newPreprints) {
    newPreprintsStore.set(newPreprints);
  }

  return [newPreprints, setNewPreprints];
}

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
