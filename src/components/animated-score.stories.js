import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import ScoreBadge from './score-badge';

export default { title: 'AnimatedScore' };

const actions = Array.from({ length: 10 }, (_, i) => {
  return {
    '@type':
      Math.random() <= 0.5
        ? 'RapidPREreviewAction'
        : 'RequestForRapidPREreviewAction',
    startTime: new Date(Date.now() - i * 1000 * 60 * 60).toISOString()
  };
});

export function Demo() {
  return <AnimatedScore actions={actions} />;
}

function AnimatedScore({ actions }) {
  const sorted = useMemo(() => {
    return actions.slice().sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [actions]);

  const [index, setIndex] = useState(null);

  useEffect(() => {
    if (index > 1) {
      const timeoutId = setTimeout(() => {
        setIndex(index - 1);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [index]);

  function handleStartAnim() {
    setIndex(sorted.length - 1);
  }
  function handleStopAnim() {
    setIndex(null);
  }

  const nRequests = getNRequests(
    actions.slice(0, index === null ? actions.length : index)
  );
  const nReviews = getNReviews(
    actions.slice(0, index === null ? actions.length : index)
  );
  return (
    <div
      onMouseEnter={handleStartAnim}
      onMouseLeave={handleStopAnim}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <ScoreBadge
        nRequests={nRequests}
        nReviews={nReviews}
        dateFirstActivity={
          actions[index === null ? actions.length - 1 : index].startTime
        }
      />
      <span style={{ marginLeft: '4px' }}>
        reviews {nReviews} + requests {nRequests}
      </span>
    </div>
  );
}

AnimatedScore.propTypes = {
  actions: PropTypes.array
};

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
