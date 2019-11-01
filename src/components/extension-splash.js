import React from 'react';
import HeaderBar from './header-bar';
import Button from './button';
import LabelStyle from './label-style';

export default function ExtensionSplash() {
  return (
    <div className="extension-splash">
      <HeaderBar />
      <div className="extension-splash__content">
        <h1 className="extension-splash__title">
          Add Rapid PREreview to your browser
        </h1>

        <div className="extension-splash__body">
          <p>
            The Outbreak Science Rapid PREreview app lets you read and add
            reviews (or requests for feedback) directly from the preprint sites
            you visit without having to navigate to the Rapid PREreview
            homepage.
          </p>
          <img
            src="images/extension-preview.png"
            className="extension-splash__screenshot"
          />
          <ul className="extension-splash__browser-list">
            <li className="extension-splash__browser-list-item">
              <Button
                className="extension-splash__install-button"
                primary={true}
              >
                Install for Chrome
              </Button>
            </li>
            <li className="extension-splash__browser-list-item">
              <Button
                className="extension-splash__install-button"
                primary={true}
                disabled={true}
              >
                Install for Firefox
              </Button>
              <br />
              <div className="extension-splash__comming-soon">
                <LabelStyle>(comming soon)</LabelStyle>
              </div>
            </li>
          </ul>

          <p className="extension-splash__request-browser">
            Don’t see support for your browser? <br />{' '}
            <a href="#">let us know!</a>
          </p>
        </div>
      </div>
    </div>
  );
}
