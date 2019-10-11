import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useUser } from '../contexts/user-context';
import { usePreprintActions, usePostAction } from '../hooks/api-hooks';
import RapidPreReviewLogo from './rapid-pre-review-logo';
import Controls from './controls';
import Button from './button';
import RapidFormFragment from './rapid-form-fragment';
import { getReviewAnswers, checkIfAllAnswered } from '../utils/actions';
import { getId, arrayify } from '../utils/jsonld';
import { createPreprintIdentifierCurie } from '../utils/ids';

// TODO required login modal

export default function ShellContent({ preprint, defaultTab = 'read' }) {
  const [actions, fetchActionsProgress] = usePreprintActions(
    preprint.doi || preprint.arXivId
  );

  const [post, postProgress] = usePostAction();

  const [tab, setTab] = useState(defaultTab);

  return (
    <div className="shell-content">
      <header>
        <RapidPreReviewLogo />
        <nav>
          <ul>
            <li>
              <Button
                disabled={postProgress.isActive}
                onClick={() => setTab('read')}
              >
                Read reviews
              </Button>
            </li>
            <li>
              <Button
                disabled={postProgress.isActive}
                onClick={() => setTab('review')}
              >
                Add Review
              </Button>
            </li>
            <li>
              <Button
                disabled={postProgress.isActive}
                onClick={() => setTab('request')}
              >
                Add Request
              </Button>
            </li>
          </ul>
        </nav>
      </header>

      <div className="shell-content__body">
        {tab === 'read' ? (
          <ShellContentRead preprint={preprint} actions={actions} />
        ) : tab === 'request' ? (
          <ShellContentRequest
            preprint={preprint}
            onSubmit={action => {
              post(action, () => {
                setTab('read');
              });
            }}
            disabled={postProgress.isActive}
            error={
              postProgress.body &&
              postProgress.body['@type'] === 'RequestForRapidPREreviewAction' &&
              postProgress.error
            }
          />
        ) : (
          <ShellContentReview
            preprint={preprint}
            onSubmit={action => {
              post(action, () => {
                setTab('read');
              });
            }}
            disabled={postProgress.isActive}
            error={
              postProgress.body &&
              postProgress.body['@type'] === 'RapidPREreviewAction' &&
              postProgress.error
            }
          />
        )}
      </div>
    </div>
  );
}

ShellContent.propTypes = {
  preprint: PropTypes.object.isRequired,
  defaultTab: PropTypes.oneOf(['read', 'review', 'request'])
};

function ShellContentRead({ preprint, actions }) {
  return <div>Read</div>;
}
ShellContentRead.propTypes = {
  preprint: PropTypes.object.isRequired,
  actions: PropTypes.array.isRequired
};

function ShellContentReview({ preprint, onSubmit, disabled, error }) {
  const [user] = useUser();
  const [answerMap, setAnswerMap] = useState({}); // TODO read from local storage ?

  const canSubmit = checkIfAllAnswered(answerMap);

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
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
                agent: getId(arrayify(user.hasRole)[0]),
                object: createPreprintIdentifierCurie(preprint),
                resultReview: {
                  '@type': 'RapidPREreview',
                  reviewAnswer: getReviewAnswers(answerMap)
                }
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
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error)
};

function ShellContentRequest({ preprint, onSubmit, disabled, error }) {
  const [user] = useUser();

  return (
    <div>
      Request
      <Controls error={error}>
        <Button
          disabled={disabled}
          onClick={() => {
            onSubmit({
              '@type': 'RequestForRapidPREreviewAction',
              actionStatus: 'CompletedActionStatus',
              agent: getId(arrayify(user.hasRole)[0]),
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
  preprint: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.instanceOf(Error)
};
