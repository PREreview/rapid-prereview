import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { usePreprintActions } from '../hooks/api-hooks';
import Button from './button';
import { getId, arrayify } from '../utils/jsonld';
import { useUser } from '../contexts/user-context';
import { TOGGLE_SHELL_TAB } from '../constants';

export default function Popup({ preprint, dispatch }) {
  const [user] = useUser();

  const [actions, fetchActionsProgress] = usePreprintActions(
    preprint ? preprint.doi || preprint.arXivId : undefined
  );

  const nRequests = actions.reduce((count, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  const nReviews = actions.reduce((count, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  const hasReviewed = actions.some(
    action =>
      action['@type'] === 'RapidPREreviewAction' &&
      user &&
      arrayify(user.hasRole).some(role => getId(role) === getId(action.agent))
  );
  const hasRequested = actions.some(
    action =>
      action['@type'] === 'RequestForRapidPREreviewAction' &&
      user &&
      arrayify(user.hasRole).some(role => getId(role) === getId(action.agent))
  );

  return (
    <div className="popup">
      {preprint ? (
        <section>
          <dl>
            <dt>Reviews</dt>
            <dd>{nReviews}</dd>
            <dt>Requests for review</dt>
            <dd>{nRequests}</dd>
          </dl>

          {!!nReviews && (
            <Button
              onClick={() => {
                dispatch({ type: TOGGLE_SHELL_TAB, payload: 'read' });
              }}
            >
              Read Reviews
            </Button>
          )}
          {user ? (
            <Fragment>
              {!hasReviewed && (
                <Button
                  onClick={() => {
                    dispatch({ type: TOGGLE_SHELL_TAB, payload: 'review' });
                  }}
                >
                  Add Reviews
                </Button>
              )}
              {!hasRequested && (
                <Button
                  onClick={() => {
                    dispatch({ type: TOGGLE_SHELL_TAB, payload: 'request' });
                  }}
                >
                  Add Request
                </Button>
              )}
            </Fragment>
          ) : (
            <Fragment>
              <a
                href={`${process.env.API_URL}/login`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Log in
              </a>{' '}
              to request or add reviews
            </Fragment>
          )}
        </section>
      ) : (
        <section>
          <p>This extension is only active on preprint page.</p>
        </section>
      )}

      <nav>
        <ul>
          <li>
            <a
              href={`${process.env.API_URL}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href={`${process.env.API_URL}/settings`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Settings
            </a>
          </li>
          {!!(user || !preprint) && (
            <li>
              {user ? (
                <a
                  href={`${process.env.API_URL}/logout`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Logout
                </a>
              ) : !preprint ? (
                <a
                  href={`${process.env.API_URL}/login`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Login
                </a>
              ) : null}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

Popup.propTypes = {
  user: PropTypes.object, // if defined user is logged in
  preprint: PropTypes.object, // if defined we are on a page that is actionable
  dispatch: PropTypes.func.isRequired
};
