import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeaderBar from './header-bar';
import XLink from './xlink';

export default function NotFound() {
  return (
    <div className="not-found">
      <HeaderBar />

      <Helmet>
        <title>Rapid PREreview • Not Found</title>
      </Helmet>

      <div className="not-found__body">
        <h1>Not found</h1>

        <p>
          Visit Outbreak Science Rapid PREreview{' '}
          <XLink to="/" href="/">
            Homepage
          </XLink>
        </p>
      </div>
    </div>
  );
}
