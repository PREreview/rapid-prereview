import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight } from 'react-icons/md';
import { usePreprintActions } from '../hooks/api-hooks';
import Button from './button';
import { useUser } from '../contexts/user-context';
import { TOGGLE_SHELL_TAB } from '../constants';
import RapidPreReviewLogo from './rapid-pre-review-logo';
import {
  checkIfHasReviewed,
  checkIfHasRequested,
  checkIfIsModerated
} from '../utils/actions';

export default function Popup({ preprint, dispatch }) {
  const [user] = useUser();

  const [actions, fetchActionsProgress] = usePreprintActions(
    preprint ? preprint.doi || preprint.arXivId : undefined
  );

  const safeActions = actions.filter(action => !checkIfIsModerated(action));

  const nRequests = safeActions.reduce((count, action) => {
    if (action['@type'] === 'RequestForRapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  const nReviews = safeActions.reduce((count, action) => {
    if (action['@type'] === 'RapidPREreviewAction') {
      count++;
    }
    return count;
  }, 0);

  const hasReviewed = checkIfHasReviewed(user, actions); // `actions` (_all_ of them including moderated ones) not `safeActions`
  const hasRequested = checkIfHasRequested(user, actions); // `actions` (_all_ of them including moderated ones) not `safeActions`

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
              {!!(preprint.preprintServer && preprint.preprintServer.name) && (
                <span>{preprint.preprintServer.name}</span>
              )}
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
                    window.close();
                  }}
                >
                  Read Reviews
                </Button>
              </div>
            )}

            <Fragment>
              {!hasReviewed && (
                <div className="popup__read-button-row">
                  <Button
                    disabled={!user}
                    onClick={() => {
                      dispatch({ type: TOGGLE_SHELL_TAB, payload: 'review' });
                      window.close();
                    }}
                  >
                    Add Reviews{' '}
                    {!user && (
                      <span className="popup__button-login-required">
                        (Login Required)
                      </span>
                    )}
                  </Button>
                </div>
              )}
              {!hasRequested && (
                <div className="popup__read-button-row">
                  {' '}
                  <Button
                    disabled={!user}
                    onClick={() => {
                      dispatch({
                        type: TOGGLE_SHELL_TAB,
                        payload: 'request'
                      });
                      window.close();
                    }}
                  >
                    Add Request{' '}
                    {!user && (
                      <span className="popup__button-login-required">
                        (Login Required)
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </Fragment>
          </section>
        </Fragment>
      ) : (
        <section className="popup__inactive-notice">
          <p>This extension is only active on preprint pages.</p>
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

          {!!user && (
            <li className="popup__nav__list-item">
              <a
                href={`${process.env.API_URL}/settings`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Profile Settings
              </a>
            </li>
          )}

          <li className="popup__nav__list-item">
            {user ? (
              <a
                href={`${process.env.API_URL}/auth/logout`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Logout
              </a>
            ) : preprint ? (
              <a
                href={`${process.env.API_URL}/login?next=${preprint.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Login
              </a>
            ) : (
              <a
                href={`${process.env.API_URL}/login`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Login
              </a>
            )}
          </li>
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

export function LocalPopup({ counts, hasGscholar }) {
  return (
    <div className="local-popup popup">
      <div className="popup__logo-row">
        <RapidPreReviewLogo
          className="popup__logo"
          short={true}
          responsive={false}
        />
      </div>

      {hasGscholar ? (
        <section className="popup__stats-section">
          <dl className="popup__stats">
            <div className="popup__stats__row">
              <dt className="popup__stats__label">Reviews</dt>
              <dd className="popup__stats__value">{counts.nReviews}</dd>
            </div>
            <div className="popup__stats__row">
              <dt className="popup__stats__label">Requests for review</dt>
              <dd className="popup__stats__value">{counts.nRequests}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <section className="popup__inactive-notice">
          <p>This extension is only active on preprint pages.</p>
        </section>
      )}
    </div>
  );
}

LocalPopup.propTypes = {
  hasGscholar: PropTypes.bool.isRequired,
  counts: PropTypes.shape({
    nReviews: PropTypes.number.isRequired,
    nRequests: PropTypes.number.isRequired
  }).isRequired
};
