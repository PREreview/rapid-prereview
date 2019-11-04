import React from 'react';
import PropTypes from 'prop-types';

const ScoreBadge = React.forwardRef(function ScoreBadge(
  { nRequests, nReviews },
  ref
) {
  const statusClass =
    nRequests > 0 && nReviews === 0 ? 'needs-attention' : 'normal';

  return (
    <div ref={ref} className={`score-badge score-badge--${statusClass}`}>
      <div className="score-badge__score">{nRequests + nReviews}</div>
    </div>
  );
});

ScoreBadge.propTypes = {
  nRequests: PropTypes.number,
  nReviews: PropTypes.number
};

export default ScoreBadge;
