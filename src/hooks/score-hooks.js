import { useMemo, useState, useEffect, useCallback } from 'react';

/**
 * Note actions should always have a length of at least 1 as only preprint
 * with reviews or requests for reviews are listed
 */
export function useAnimatedScore(actions) {
  const sorted = useMemo(() => {
    return actions.slice().sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [actions]);

  const [index, setIndex] = useState(null);

  useEffect(() => {
    if (index !== null && index < sorted.length - 1) {
      const totalAnimTime = Math.min(sorted.length * 100, 600);

      const tmin = new Date(sorted[0].startTime).getTime();
      const tmax = new Date(sorted[sorted.length - 1].startTime).getTime();

      const t = new Date(sorted[Math.max(index, 0)].startTime).getTime();

      let timeout;
      if (sorted.length > 1) {
        const nextT = new Date(
          sorted[Math.max(index + 1, 0)].startTime
        ).getTime();

        const rT = ((t - tmin) / (tmax - tmin)) * totalAnimTime;
        const rNextT = ((nextT - tmin) / (tmax - tmin)) * totalAnimTime;
        timeout = rNextT - rT;
      } else {
        timeout = totalAnimTime;
      }

      const timeoutId = setTimeout(() => {
        setIndex(index + 1);
      }, timeout);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [index, sorted]);

  const handleStartAnim = useCallback(function handleStartAnim() {
    setIndex(-1);
  }, []);
  const handleStopAnim = useCallback(function handleStopAnim() {
    setIndex(null);
  }, []);

  const nRequests =
    index === -1
      ? 0
      : getNRequests(
          sorted.slice(0, index === null ? actions.length : index + 1)
        );
  const nReviews =
    index === -1
      ? 0
      : getNReviews(
          sorted.slice(0, index === null ? actions.length : index + 1)
        );

  const now =
    index === null
      ? undefined
      : index === -1
      ? sorted[0] && sorted[0].startTime
      : sorted[index].startTime;

  return {
    nRequests,
    nReviews,
    now,
    dateFirstActivity: sorted[0] && sorted[0].startTime,
    onStartAnim: handleStartAnim,
    onStopAnim: handleStopAnim
  };
}

function getNReviews(actions) {
  return actions.reduce((count, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);
}

function getNRequests(actions) {
  return actions.reduce((count, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);
}
