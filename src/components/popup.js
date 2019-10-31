import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight } from 'react-icons/md';

import { usePreprintActions } from '../hooks/api-hooks';
import Button from './button';
import { getId, arrayify } from '../utils/jsonld';
import { useUser } from '../contexts/user-context';
import { TOGGLE_SHELL_TAB } from '../constants';
import RapidPreReviewLogo from './rapid-pre-review-logo';

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
      <div className="popup__logo-row">
        <RapidPreReviewLogo
          className="popup__logo"
          short={true}
          responsive={false}
        />
      </div>
      {preprint ? (
        <Fragment>
          <section className="popup__stats-section">
            <div className="popup__preprint-info">
              <span>{preprint.preprintServer.name}</span>
              <MdChevronRight />
              <span>{preprint.doi || preprint.arXivId}</span>
            </div>

            <dl className="popup__stats">
              <div className="popup__stats__row">
                <dt className="popup__stats__label">Reviews</dt>
                <dd className="popup__stats__value">{nReviews}</dd>
              </div>
              <div className="popup__stats__row">
                <dt className="popup__stats__label">Requests for review</dt>
                <dd className="popup__stats__value">{nRequests}</dd>
              </div>
            </dl>
          </section>
          <section className="popup__actions-section">
            {!!nReviews && (
              <div className="popup__read-button-row">
                <Button
                  onClick={() => {
                    dispatch({ type: TOGGLE_SHELL_TAB, payload: 'read' });
                  }}
                >
                  Read Reviews
                </Button>
              </div>
            )}
            {user ? (
              <Fragment>
                {!hasReviewed && (
                  <div className="popup__read-button-row">
                    <Button
                      onClick={() => {
                        dispatch({ type: TOGGLE_SHELL_TAB, payload: 'review' });
                      }}
                    >
                      Add Reviews
                    </Button>
                  </div>
                )}
                {!hasRequested && (
                  <div className="popup__read-button-row">
                    {' '}
                    <Button
                      onClick={() => {
                        dispatch({
                          type: TOGGLE_SHELL_TAB,
                          payload: 'request'
                        });
                      }}
                    >
                      Add Request
                    </Button>
                  </div>
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
        </Fragment>
      ) : (
        <section>
          <p>This extension is only active on preprint page.</p>
        </section>
      )}

      <nav className="popup__nav">
        <ul className="popup__nav__list">
          <li className="popup__nav__list-item">
            <a
              href={`${process.env.API_URL}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Home
            </a>
          </li>
          <li className="popup__nav__list-item">
            <a
              href={`${process.env.API_URL}/settings`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Profile Settings
            </a>
          </li>
          {!!(user || !preprint) && (
            <li className="popup__nav__list-item">
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
