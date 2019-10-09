import React from 'react';
import PropTypes from 'prop-types';

export default function Controls({ error, children }) {
  const errMsg = formatError(error);

  return (
    <div className="controls">
      {!!errMsg && <div>{errMsg}</div>}

      <div className="controls__body">
        <div className="controls__buttons">{children}</div>
      </div>
    </div>
  );
}
Controls.propTypes = {
  children: PropTypes.any,
  error: PropTypes.oneOfType([
    PropTypes.instanceOf(Error),
    PropTypes.shape({
      '@type': PropTypes.oneOf(['Error']),
      name: PropTypes.string,
      description: PropTypes.string,
      statusCode: PropTypes.number
    })
  ])
};

function formatError(err) {
  if (!err) return '';

  const message = err.message || err.description;
  const name = err.name;
  const statusCode = err.statusCode;

  if (message) {
    if (name && statusCode) {
      return `${name}: ${message} (${statusCode.toString()})`;
    } else if (name) {
      return `${name}: ${message}`;
    } else if (statusCode) {
      return `${message} (${statusCode.toString()})`;
    }
  } else if (name) {
    if (statusCode) {
      return `${name} (${statusCode.toString()})`;
    } else {
      return name;
    }
  } else if (statusCode) {
    return statusCode.toString();
  } else {
    return '';
  }
}
