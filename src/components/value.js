import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Value({
  tagName = 'div',
  children,
  className,
  ...others
}) {
  if (children == null) {
    return null;
  }

  return React.createElement(
    tagName,
    Object.assign(
      {
        className: classNames('value', className)
      },
      children['@type'] === 'rdf:HTML'
        ? {
            dangerouslySetInnerHTML: { __html: children['@value'] },
            datatype: children['@type']
          }
        : undefined,
      others
    ),
    children['@type'] !== 'rdf:HTML' ? children : undefined
  );
}

Value.propTypes = {
  className: PropTypes.string,
  tagName: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      '@type': PropTypes.string,
      '@value': PropTypes.string
    })
  ]).isRequired
};
