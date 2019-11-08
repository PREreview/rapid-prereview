import React from 'react';
import PropTypes from 'prop-types';
import Button from './button';

export default function APISection({ id, title, children }) {
  return (
    <div className="api-section">
      <header>
        <h2 id={id}>
          GET <code>/api/review/:id</code>
        </h2>

        <Button primary={true}>Run</Button>
      </header>

      {children}
    </div>
  );
}

APISection.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.any.isRequired,
  children: PropTypes.any.isRequired
};
