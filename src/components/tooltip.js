import React from 'react';
import PropTypes from 'prop-types';

import ReachTooltip from '@reach/tooltip';
import classNames from 'classnames';

export default function Tooltip({ className, children, ...reachTooltipProps }) {
  return (
    <ReachTooltip
      className={classNames('tooltip', className)}
      {...reachTooltipProps}
    >
      {children}
    </ReachTooltip>
  );
}

Tooltip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};
