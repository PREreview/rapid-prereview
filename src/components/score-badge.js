import React from 'react';
import PropType from 'prop-types';

export default function ScoreBadge({ score, nRequests, nReviews }) {
  const statusClass =
    nRequests > 0 && nReviews === 0 ? 'needs-attention' : 'normal';

  return (
    <div className={`score-badge score-badge--${statusClass}`}>
      <div className="score-badge__score">{score}</div>
    </div>
  );
}

ScoreBadge.propTypes = {
  score: PropType.number.isRequired
};
