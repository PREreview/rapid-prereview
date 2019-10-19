import React from 'react';
import PropTypes from 'prop-types';

export default function ScoreBadge({ nRequests, nReviews }) {
  const statusClass =
    nRequests > 0 && nReviews === 0 ? 'needs-attention' : 'normal';

  return (
    <div className={`score-badge score-badge--${statusClass}`}>
      <div className="score-badge__score">{nRequests + nReviews}</div>
    </div>
  );
}

ScoreBadge.propTypes = {
  nRequests: PropTypes.number,
  nReviews: PropTypes.number
};
