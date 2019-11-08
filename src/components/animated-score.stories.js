import React from 'react';
import { useAnimatedScore } from '../hooks/score-hooks';
import ScoreBadge from './score-badge';

export default { title: 'AnimatedScore' };

const actions = Array.from({ length: 10 }, (_, i) => {
  return {
    '@type':
      Math.random() <= 0.5
        ? 'RapidPREreviewAction'
        : 'RequestForRapidPREreviewAction',
    startTime: new Date(new Date().getTime() - i * 1000 * 60 * 60).toISOString()
  };
});

export function Demo() {
  const {
    nRequests,
    nReviews,
    now,
    onStartAnim,
    onStopAnim,
    dateFirstActivity
  } = useAnimatedScore(actions);

  return (
    <div
      onMouseEnter={onStartAnim}
      onMouseLeave={onStopAnim}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <ScoreBadge
        now={now}
        nRequests={nRequests}
        nReviews={nReviews}
        dateFirstActivity={dateFirstActivity}
      />
      <span style={{ marginLeft: '4px' }}>
        reviews {nReviews} + requests {nRequests}
      </span>
    </div>
  );
}
