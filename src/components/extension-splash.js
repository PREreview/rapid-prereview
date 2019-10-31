import React from 'react';
import HeaderBar from './header-bar';

export default function ExtensionSplash() {
  return (
    <div className="extension-splash">
      <HeaderBar />

      <h1>Add Rapid PREreview to your browser</h1>

      <p>
        The Rapid PREreview app let you read and add reviews (or requests for
        feedback) directly from the preprint sites you visit without having to
        navigate to the Rapid PREreview homepage.
      </p>

      <ul>
        <li>Install for Chrome</li>
        <li>Install for Firefox (comming soon)</li>
      </ul>

      <p>
        Don’t see support for your browser? <a href="#">let us know!</a>
      </p>
    </div>
  );
}
