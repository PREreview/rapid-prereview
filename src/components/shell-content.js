import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useHistory } from 'react-router-dom';
import uniq from 'lodash/uniq';
import classNames from 'classnames';
import { Helmet } from 'react-helmet-async';
import { MenuLink } from '@reach/menu-button';
import { useUser } from '../contexts/user-context';
import { usePreprintActions, usePostAction, useRole } from '../hooks/api-hooks';
import { useLocalState, useNewPreprints } from '../hooks/ui-hooks';
import Controls from './controls';
import Button from './button';
import RapidFormFragment from './rapid-form-fragment';
import {
  getReviewAnswers,
  checkIfAllAnswered,
  checkIfHasReviewed,
  checkIfHasRequested,
  checkIfIsModerated
} from '../utils/actions';
import { getCounts } from '../utils/stats';
import { getId, cleanup, unprefix, nodeify } from '../utils/jsonld';
import { createPreprintIdentifierCurie, createPreprintId } from '../utils/ids';
import LoginRequiredModal from './login-required-modal';
import UserBadge from './user-badge';
import SubjectEditor from './subject-editor';
import ReviewReader from './review-reader';
import PreprintPreview from './preprint-preview';
import XLink from './xlink';
import ModerationModal from './moderation-modal';
import { preprintify } from '../utils/preprints';
import { checkIfRoleLacksMininmalData } from '../utils/roles';
import NoticeBadge from './notice-badge';

// !! this needs to work both in web and extension use
// `process.env.IS_EXTENSION` to assess the environment we are in.

export default function ShellContent({
  preprint,
  defaultTab = 'read',
  onRequireScreen
}) {
  const location = useLocation();
  const [user] = useUser();
  const [role] = useRole(user && user.defaultRole);
  const [newPreprints, setNewPreprints] = useNewPreprints();

  const [actions, fetchActionsProgress] = usePreprintActions(
    preprint.doi || preprint.arXivId
  );
  
  const safeActions = actions.filter(action => !checkIfIsModerated(action));

  const [post, postProgress] = usePostAction();

  const [tab, setTab] = useState(defaultTab);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const hasReviewed = checkIfHasReviewed(user, actions); // `actions` (_all_ of them including moderated ones) not `safeActions`
  const hasRequested = checkIfHasRequested(user, actions); // `actions` (_all_ of them including moderated ones) not `safeActions`

  const counts = getCounts(actions);

  const extensionNextURL = new URL(window.location.href);
  extensionNextURL.hash = '#osrpre-shell';

  const loginUrl = process.env.IS_EXTENSION
    ? `/login?next=${encodeURIComponent(extensionNextURL)}`
    : `/login?next=${encodeURIComponent(location.pathname)}`;

  const showProfileNotice = checkIfRoleLacksMininmalData(role);

  return (
    <div className="shell-content">
      {!process.env.IS_EXTENSION && (
        <Helmet>
          {/* Data for the extension popup menu */}
          <meta
            name="rapid-prereview-extension-nreviews"
            content={counts.nReviews}
          />
          <meta
            name="rapid-prereview-extension-nrequests"
            content={counts.nRequests}
          />
        </Helmet>
      )}

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
          <UserBadge
            className="shell-content__user"
            user={user}
            showNotice={showProfileNotice}
          >
            {showProfileNotice && (
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
                Complete Profile
                <div className="menu__link-item__icon">
                  <NoticeBadge />
                </div>
              </MenuLink>
            )}

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
              User Settings
            </MenuLink>

            {user.isAdmin && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/admin'}
                href={
                  process.env.IS_EXTENSION
                    ? `${process.env.API_URL}/admin`
                    : undefined
                }
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Admin Settings
              </MenuLink>
            )}

            {user.isAdmin && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/block'}
                href={
                  process.env.IS_EXTENSION
                    ? `${process.env.API_URL}/block`
                    : undefined
                }
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Moderate Users
              </MenuLink>
            )}

            {!!(role && role.isModerator && !role.isModerated) && (
              <MenuLink
                as={process.env.IS_EXTENSION ? undefined : Link}
                to={process.env.IS_EXTENSION ? undefined : '/moderate'}
                href={
                  process.env.IS_EXTENSION
                    ? `${process.env.API_URL}/moderate`
                    : undefined
                }
                target={process.env.IS_EXTENSION ? '_blank' : undefined}
              >
                Moderate Reviews
              </MenuLink>
            )}

            <MenuLink href={`${process.env.API_URL}/auth/logout`}>
              Logout
            </MenuLink>
          </UserBadge>
        ) : (
          <XLink href={loginUrl} to={loginUrl} target="_self">
            Login
          </XLink>
        )}
      </header>
      {isLoginModalOpen && (
        <LoginRequiredModal
          next={process.env.IS_EXTENSION ? extensionNextURL : location.pathname}
          target="_self"
          onClose={() => {
            setIsLoginModalOpen(false);
          }}
        />
      )}
      <div className="shell-content__body">
        {tab === 'read' ? (
          <ShellContentRead
            user={user}
            preprint={preprint}
            actions={safeActions}
            fetchActionsProgress={fetchActionsProgress}
          />
        ) : tab === 'request' ? (
          <ShellContentRequest
            user={user}
            preprint={preprint}
            onSubmit={action => {
              post(action, body => {
                setTab('request#success');

                const isNew =
                  !fetchActionsProgress.isActive &&
                  actions.filter(_action => getId(_action) !== getId(body))
                    .length === 0;

                if (
                  !process.env.IS_EXTENSION &&
                  isNew &&
                  !newPreprints.some(
                    _preprint => getId(_preprint) === getId(preprint)
                  )
                ) {
                  setNewPreprints(
                    newPreprints.concat(preprintify(preprint, body))
                  );
                }
              });
            }}
            isPosting={postProgress.isActive}
            disabled={postProgress.isActive}
            error={
              postProgress.body &&
              postProgress.body['@type'] === 'RequestForRapidPREreviewAction'
                ? postProgress.error
                : undefined
            }
          />
        ) : tab === 'review' ? (
          <ShellContentReview
            user={user}
            preprint={preprint}
            onSubmit={action => {
              post(action, body => {
                setTab('review#success');

                const isNew =
                  !fetchActionsProgress.isActive &&
                  actions.filter(_action => getId(_action) !== getId(body))
                    .length === 0;

                if (
                  !process.env.IS_EXTENSION &&
                  isNew &&
                  !newPreprints.some(
                    _preprint => getId(_preprint) === getId(preprint)
                  )
                ) {
                  setNewPreprints(
                    newPreprints.concat(preprintify(preprint, body))
                  );
                }
              });
            }}
            isPosting={postProgress.isActive}
            disabled={postProgress.isActive}
            error={
              postProgress.body &&
              postProgress.body['@type'] === 'RapidPREreviewAction'
                ? postProgress.error
                : undefined
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

function ShellContentRead({ user, preprint, actions, fetchActionsProgress }) {
  // Note: !! this needs to work both in the webApp where it is URL driven and in
  // the extension where it is shell driven

  const location = useLocation();
  const history = useHistory();
  const [moderatedReviewId, setModeratedReviewId] = useState(null);
  const [post, postProgress, resetPostState] = usePostAction();
  const [role, fetchRoleProgress] = useRole(user && user.defaultRole);

  // sanitize qs
  useEffect(() => {
    if (!process.env.IS_EXTENSION && !fetchActionsProgress.isActive) {
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

  let appRoleIds;
  if (!process.env.IS_EXTENSION) {
    const qs = new URLSearchParams(location.search);
    const roleIdsQs = qs.get('role');

    appRoleIds = roleIdsQs
      ? roleIdsQs.split(',').map(id => `role:${id}`)
      : undefined;
  }

  const [extensionRoleIds, setExtensionRoleIds] = useState();

  const roleIds = process.env.IS_EXTENSION ? extensionRoleIds : appRoleIds;

  return (
    <div className="shell-content-read">
      <header className="shell-content-read__title">Reviews</header>

      <PreprintPreview preprint={preprint} />

      {!fetchActionsProgress.isActive && (
        <ReviewReader
          user={user}
          role={role}
          isModerationInProgress={postProgress.isActive}
          onModerate={reportedActionId => {
            resetPostState();
            setModeratedReviewId(reportedActionId);
          }}
          onHighlighedRoleIdsChange={roleIds => {
            if (process.env.IS_EXTENSION) {
              setExtensionRoleIds(roleIds);
            } else {
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
            }
          }}
          defaultHighlightedRoleIds={roleIds}
          identifier={preprint.doi || preprint.arXivId}
          actions={actions.filter(
            action => action['@type'] === 'RapidPREreviewAction'
          )}
          nRequests={actions.reduce((count, action) => {
            if (action['@type'] === 'RequestForRapidPREreviewAction') {
              count++;
            }
            return count;
          }, 0)}
        />
      )}

      {!!moderatedReviewId && (
        <ModerationModal
          title={`Report review as violating the Code of Conduct`}
          moderationProgress={postProgress}
          onSubmit={(moderationReason, onSuccess) => {
            post(
              cleanup({
                '@type': 'ReportRapidPREreviewAction',
                agent: user.defaultRole,
                actionStatus: 'CompletedActionStatus',
                object: moderatedReviewId,
                moderationReason
              }),
              body => {
                onSuccess();
              }
            );
          }}
          onCancel={() => {
            setModeratedReviewId(null);
          }}
        />
      )}
    </div>
  );
}
ShellContentRead.propTypes = {
  user: PropTypes.object,
  preprint: PropTypes.object.isRequired,
  actions: PropTypes.array.isRequired,
  fetchActionsProgress: PropTypes.object.isRequired
};

function ShellContentReview({
  user,
  preprint,
  onSubmit,
  disabled,
  isPosting,
  error
}) {
  const [subjects, setSubjects] = useLocalState(
    'subjects',
    user.defaultRole,
    createPreprintId(preprint),
    []
  );
  const [answerMap, setAnswerMap] = useLocalState(
    'answerMap',
    user.defaultRole,
    createPreprintId(preprint),
    {}
  );

  const canSubmit = checkIfAllAnswered(answerMap);

  return (
    <div className="shell-content-review">
      <header className="shell-content-review__title">Add a review</header>

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
            primary={true}
            isWaiting={isPosting}
            disabled={disabled || !canSubmit}
            onClick={() => {
              onSubmit({
                '@type': 'RapidPREreviewAction',
                actionStatus: 'CompletedActionStatus',
                agent: getId(user.defaultRole),
                object: Object.assign({}, nodeify(preprint), {
                  '@id': createPreprintIdentifierCurie(preprint)
                }),
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
  isPosting: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error)
};

function ShellContentRequest({
  user,
  preprint,
  onSubmit,
  disabled,
  isPosting,
  error
}) {
  return (
    <div className="shell-content-request">
      <header className="shell-content-request__title">
        Add a request for review
      </header>

      <PreprintPreview preprint={preprint} />

      <Controls error={error}>
        <Button
          primary={true}
          isWaiting={isPosting}
          disabled={disabled}
          onClick={() => {
            onSubmit({
              '@type': 'RequestForRapidPREreviewAction',
              actionStatus: 'CompletedActionStatus',
              agent: user.defaultRole,
              object: Object.assign({}, nodeify(preprint), {
                '@id': createPreprintIdentifierCurie(preprint)
              })
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
  isPosting: PropTypes.bool,
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
