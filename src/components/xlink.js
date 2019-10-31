import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function XLink({ to, href, children, ...others }) {
  return process.env.IS_EXTENSION ? (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...others}
      href={`${process.env.API_URL}${href}`}
    >
      {children}
    </a>
  ) : (
    <Link {...others} to={to}>
      {children}
    </Link>
  );
}

XLink.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  href: function(props, propName, componentName) {
    if (!/^\//.test(props[propName])) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName} href must be a relative link starting with /`
      );
    }
  },
  children: PropTypes.any
};
