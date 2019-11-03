import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import HeaderBar from './header-bar';

/**
 * Use that for all the documentation like pages (Code of Conduct etc.)
 */
export default function TocPage({ children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="toc-page">
      <HeaderBar />

      <div className="toc-page__body">{children}</div>
    </div>
  );
}

TocPage.propTypes = {
  children: PropTypes.any.isRequired
};
