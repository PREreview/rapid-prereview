import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useHistory } from 'react-router-dom';
import uniq from 'lodash/uniq';
import classNames from 'classnames';
import { MenuLink } from '@reach/menu-button';
import { useUser } from '../contexts/user-context';
import { usePreprintActions, usePostAction } from '../hooks/api-hooks';
import Controls from './controls';
import Button from './button';
import RapidFormFragment from './rapid-form-fragment';
import {
  getReviewAnswers,
  checkIfAllAnswered,
  checkIfHasReviewed,
  checkIfHasRequested
} from '../utils/actions';
import { getId, cleanup, unprefix } from '../utils/jsonld';
import { useLocalState } from '../hooks/ui-hooks';
import { createPreprintIdentifierCurie, createPreprintId } from '../utils/ids';
import LoginRequiredModal from './login-required-modal';
import { getDefaultRole } from '../utils/users';
import UserBadge from './user-badge';
import SubjectEditor from './subject-editor';
import ReviewReader from './review-reader';
import PreprintPreview from './preprint-preview';
import XLink from './xlink';

export default function ShellContent({
  preprint,
  defaultTab = 'read',
  onRequireScreen
}) {
  const [user] = useUser();

  const [actions, fetchActionsProgress] = usePreprintActions(
    preprint.doi || preprint.arXivId
  );

  const [post, postProgress] = usePostAction();

  const [tab, setTab] = useState(defaultTab);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const hasReviewed = checkIfHasReviewed(user, actions);
  const hasRequested = checkIfHasRequested(user, actions);

  return (
    <div className="shell-content">
      <header className="shell-content__header">
        <nav>
          <ul>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'read'
                })}
                disabled={postProgress.isActive}
                onClick={() => {
                  onRequireScreen();
                  setTab('read');
                }}
              >
                Read reviews
              </Button>
            </li>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'review'
                })}
                disabled={postProgress.isActive || hasReviewed}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('review');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Review
              </Button>
            </li>
            <li>
              <Button
                className={classNames('shell-content__tab-button', {
                  'shell-content__tab-button--active': tab === 'request'
                })}
                disabled={postProgress.isActive || hasRequested}
                onClick={() => {
                  if (user) {
                    onRequireScreen();
                    setTab('request');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                Add Request
              </Button>
            </li>
          </ul>
        </nav>

        {user ? (
          <UserBadge user={user} className="shell-content__user">
            <MenuLink
              as={process.env.IS_EXTENSION ? undefined : Link}
              to={process.env.IS_EXTENSION ? undefined : '/settings'}
              href={
                process.env.IS_EXTENSION
                  ? `${process.env.API_URL}/settings`
                  : undefined
              }
              target={process.env.IS_EXTENSION ? '_blank' : undefined}
            >
              Settings
            </MenuLink>
            <MenuLink href={`${process.env.API_URL}/auth/logout`}>
              Logout
            </MenuLink>
          </UserBadge>
        ) : (
          <XLink href="/login" to="/login">
            Login
          </XLink>
        )}
      </header>

      {isLoginModalOpen && (
        <LoginRequiredModal
          onClose={() => {
            setIsLoginModalOpen(false);
          }}
        />
      )}

      <div className="shell-content__body">
        {tab === 'read' ? (
          <ShellContentRead
            preprint={preprint}
            actions={actions}
            fetchActionsProgress={fetchActionsProgress}
          />
        ) : tab === 'request' ? (
          <ShellContentRequest
            user={user}
            preprint={preprint}
            onSubmit={action => {
              post(action, () => {
                setTab('request#success');
              });
            }}
            disabled={postProgress.isActive}
            error={
              postProgress.body &&
              postProgress.body['@type'] === 'RequestForRapidPREreviewAction' &&
              postProgress.error
            }
          />
        ) : tab === 'review' ? (
          <ShellContentReview
            user={user}
            preprint={preprint}
            onSubmit={action => {
              post(action, () => {
                setTab('review#success');
              });
            }}
            disabled={postProgress.isActive}
            error={
              postProgress.body &&
              postProgress.body['@type'] === 'RapidPREreviewAction' &&
              postProgress.error
            }
          />
        ) : tab === 'review#success' ? (
          <ShellContentReviewSuccess
            preprint={preprint}
            onClose={() => {
              setTab('read');
            }}
          />
        ) : tab === 'request#success' ? (
          <ShellContentRequestSuccess
            preprint={preprint}
            onClose={() => {
              setTab('read');
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

ShellContent.propTypes = {
  onRequireScreen: PropTypes.func.isRequired,
  preprint: PropTypes.object.isRequired,
  defaultTab: PropTypes.oneOf(['read', 'review', 'request'])
};

function ShellContentRead({ preprint, actions, fetchActionsProgress }) {
  const location = useLocation();
  const history = useHistory();

  // TODO make it work with the extension where we have no control on `location`

  // sanitize qs
  useEffect(() => {
    if (!fetchActionsProgress.isActive) {
      const qs = new URLSearchParams(location.search);
      const roleIdsQs = qs.get('role');

      if (roleIdsQs != null) {
        const raw = roleIdsQs.split(',').map(id => `role:${id}`);
        const roleIds = uniq(raw).filter(roleId =>
          actions.some(
            action =>
              action['@type'] === 'RapidPREreviewAction' &&
              getId(action.agent) === roleId
          )
        );

        if (!roleIds.length || roleIds.length !== raw.length) {
          if (roleIds.length) {
            qs.set('role', roleIds.map(unprefix));
          } else {
            qs.delete('role');
          }

          history.replace({
            hash: location.hash,
            pathname: location.pathname,
            search: qs.toString()
          });
        }
      }
    }
  }, [history, location, actions, fetchActionsProgress]);

  const qs = new URLSearchParams(location.search);
  const roleIdsQs = qs.get('role');
  const roleIds = roleIdsQs
    ? roleIdsQs.split(',').map(id => `role:${id}`)
    : undefined;

  return (
    <div className="shell-content-read">
      <header className="shell-content-read__title">Reviews</header>

      <PreprintPreview preprint={preprint} />

      <ReviewReader
        onHighlighedRoleIdsChange={roleIds => {
          const qs = new URLSearchParams(location.search);
          if (roleIds && roleIds.length) {
            qs.set('role', roleIds.map(unprefix));
          } else {
            qs.delete('role');
          }
          history.push({
            hash: location.hash,
            pathname: location.pathname,
            search: qs.toString()
          });
        }}
        defaultHighlightedRoleIds={roleIds}
        identifier={preprint.doi || preprint.arXivId}
        actions={actions.filter(
          action => action['@type'] === 'RapidPREreviewAction'
        )}
      />
    </div>
  );
}
ShellContentRead.propTypes = {
  preprint: PropTypes.object.isRequired,
  actions: PropTypes.array.isRequired,
  fetchActionsProgress: PropTypes.object.isRequired
};

function ShellContentReview({ user, preprint, onSubmit, disabled, error }) {
  const [subjects, setSubjects] = useLocalState(
    'subjects',
    getId(getDefaultRole(user)),
    createPreprintId(preprint),
    []
  );
  const [answerMap, setAnswerMap] = useLocalState(
    'answerMap',
    getId(getDefaultRole(user)),
    createPreprintId(preprint),
    {}
  );

  const canSubmit = checkIfAllAnswered(answerMap);

  return (
    <div className="shell-content-review">
      <header className="shell-content-review__title">
        Add a Rapid PREreview
      </header>

      <PreprintPreview preprint={preprint} />

      <form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <SubjectEditor
          subjects={subjects}
          onAdd={subject => {
            setSubjects(
              subjects.concat(subject).sort((a, b) => {
                return (a.alternateName || a.name).localeCompare(
                  b.alternateName || b.name
                );
              })
            );
          }}
          onDelete={subject => {
            setSubjects(
              subjects.filter(_subject => _subject.name !== subject.name)
            );
          }}
        />

        <RapidFormFragment
          answerMap={answerMap}
          onChange={(key, value) => {
            setAnswerMap(prev => {
              return Object.assign({}, prev, { [key]: value });
            });
          }}
        />

        <Controls error={error}>
          <Button
            type="submit"
            disabled={disabled || !canSubmit}
            onClick={() => {
              onSubmit({
                '@type': 'RapidPREreviewAction',
                actionStatus: 'CompletedActionStatus',
                agent: getId(getDefaultRole(user)),
                object: createPreprintIdentifierCurie(preprint),
                resultReview: cleanup(
                  {
                    '@type': 'RapidPREreview',
                    about: subjects,
                    reviewAnswer: getReviewAnswers(answerMap)
                  },
                  { removeEmptyArray: true }
                )
              });
            }}
          >
            Submit
          </Button>
        </Controls>
      </form>
    </div>
  );
}
ShellContentReview.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error)
};

function ShellContentRequest({ user, preprint, onSubmit, disabled, error }) {
  return (
    <div className="shell-content-request">
      <header className="shell-content-request__title">
        Add a request for Rapid PREreview
      </header>

      <PreprintPreview preprint={preprint} />

      <Controls error={error}>
        <Button
          disabled={disabled}
          onClick={() => {
            onSubmit({
              '@type': 'RequestForRapidPREreviewAction',
              actionStatus: 'CompletedActionStatus',
              agent: getId(getDefaultRole(user)),
              object: createPreprintIdentifierCurie(preprint)
            });
          }}
        >
          Submit
        </Button>
      </Controls>
    </div>
  );
}
ShellContentRequest.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error)
};

function ShellContentReviewSuccess({ preprint, onClose }) {
  return (
    <div className="shell-content-review-success">
      <header className="shell-content-review-success__title">Success</header>

      <PreprintPreview preprint={preprint} />

      <p>Your review has been successfully posted.</p>

      <Controls>
        <Button onClick={onClose}>View</Button>
      </Controls>
    </div>
  );
}
ShellContentReviewSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

function ShellContentRequestSuccess({ preprint, onClose }) {
  return (
    <div className="shell-content-request-success">
      <header className="shell-content-request-success__title">Success</header>

      <PreprintPreview preprint={preprint} />

      <p>Your request has been successfully posted.</p>

      <Controls>
        <Button onClick={onClose}>View</Button>
      </Controls>
    </div>
  );
}
ShellContentRequestSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};
