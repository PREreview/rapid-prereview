import React from 'react';
import PropTypes from 'prop-types';
import { usePreprintActions } from '../hooks/api-hooks';
import Button from './button';
import RapidPreReviewLogo from './rapid-pre-review-logo';

export default function ShellContent({ preprint }) {
  const [actions, fetchActionsProgress] = usePreprintActions(
    preprint.doi || preprint.arXivId
  );

  console.log(actions);

  return (
    <div className="shell-content">
      <header>
        <RapidPreReviewLogo />

        <nav>
          <ul>
            <li>
              <Button>Read reviews</Button>
            </li>
            <li>
              <Button>Add Review</Button>
            </li>
            <li>
              <Button>Add Request</Button>
            </li>
          </ul>
        </nav>
      </header>

      <div className="shell-content__body">
        <h2>hello shell</h2>
        <div
          style={{
            width: '100px',
            height: '1000px',
            backgroundColor: 'red'
          }}
        >
          big red box
        </div>

        <p>end</p>
      </div>
    </div>
  );
}

ShellContent.propTypes = {
  preprint: PropTypes.object.isRequired
};
