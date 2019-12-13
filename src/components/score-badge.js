import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getTimeScore } from '../utils/score';

const ScoreBadge = React.forwardRef(function ScoreBadge(
  {
    isHighlighted,
    nRequests,
    nReviews,
    dateFirstActivity,
    now,
    isAnimating,
    ...others
  },
  ref
) {
  const timeScore = getTimeScore(dateFirstActivity, now);

  const statusClass =
    nRequests > 0 && nReviews === 0 ? 'needs-attention' : 'normal';

  /*
     the arc polar cordinates need to be converted to x,y for svg see:
     https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
   */

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const svgArc = (x, y, radius, startAngle, endAngle) => {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    var d = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
    ].join(' ');

    return d;
  };

  return (
    <div
      ref={ref}
      className={classNames('score-badge', `score-badge--${statusClass}`, {
        'score-badge--animating': isAnimating,
        'score-badge--highlighted': isHighlighted
      })}
      {...others}
    >
      <svg viewBox="0 0 24 24" className="score-badge__clock-svg">
        <path
          d={svgArc(12, 12, 11, 0, 359.9)}
          strokeWidth="2"
          fill="none"
          className="score-badge__clock-svg__inactive-path"
        />
        <path
          d={svgArc(12, 12, 11, 0, timeScore * 359.9)}
          strokeWidth="2"
          fill="none"
          className="score-badge__clock-svg__active-path"
        />
      </svg>
      <div className="score-badge__score">{nRequests + nReviews}</div>
    </div>
  );
});

ScoreBadge.propTypes = {
  isHighlighted: PropTypes.bool,
  isAnimating: PropTypes.bool,
  now: PropTypes.string,
  nRequests: PropTypes.number.isRequired,
  nReviews: PropTypes.number.isRequired,
  dateFirstActivity: PropTypes.string.isRequired
};

export default ScoreBadge;
