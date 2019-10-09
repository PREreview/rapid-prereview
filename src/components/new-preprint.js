import React, { useState } from 'react';
import PropTypes from 'prop-types';
import identifiersArxiv from 'identifiers-arxiv';
import doiRegex from 'doi-regex';
import { format } from 'date-fns';
import Value from './value';
import { getId, arrayify, unprefix } from '../utils/jsonld';
import { usePostAction, usePreprint } from '../hooks/api-hooks';
import RapidFormFragment from './rapid-form-fragment';
import { useUser } from '../contexts/user-context';
import { getReviewAnswers, checkIfAllAnswered } from '../utils/actions';
import Controls from './controls';
import Button from './button';

export default function NewPreprint({
  onCancel,
  onReviewed,
  onRequested,
  onViewInContext
}) {
  const [identifier, setIdentifier] = useState('');
  const [preprint, resolvePreprintStatus] = usePreprint(identifier);
  const [step, setStep] = useState('NEW_PREPRINT'); // 'NEW_REVIEW' | 'NEW_REQUEST'

  return (
    <div className="new-preprint">
      {step === 'NEW_PREPRINT' ? (
        <StepPreprint
          onCancel={onCancel}
          onStep={setStep}
          onIdentifier={setIdentifier}
          identifier={identifier}
          preprint={preprint}
          resolvePreprintStatus={resolvePreprintStatus}
        />
      ) : step === 'NEW_REVIEW' ? (
        <StepReview
          onCancel={e => {
            setStep('NEW_PREPRINT');
          }}
          identifier={identifier}
          preprint={preprint}
          onReviewed={onReviewed}
          onViewInContext={onViewInContext}
        />
      ) : (
        <StepRequest
          onCancel={e => {
            setStep('NEW_PREPRINT');
          }}
          identifier={identifier}
          preprint={preprint}
          onRequested={onRequested}
          onViewInContext={onViewInContext}
        />
      )}
    </div>
  );
}
NewPreprint.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onReviewed: PropTypes.func.isRequired,
  onRequested: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};

function NewPreprintPreview({ preprint }) {
  return (
    <div>
      {!!preprint.name && <Value tagName="h2">{preprint.name}</Value>}

      {!!preprint.datePosted && (
        <span>{format(new Date(preprint.datePosted), 'MMM. d, yyyy')}</span>
      )}
      {!!(preprint.preprintServer && preprint.preprintServer.name) && (
        <Value tagName="span">{preprint.preprintServer.name}</Value>
      )}

      {!!(preprint.doi || preprint.arXivId) && (
        <span>{preprint.doi || preprint.arXivId}</span>
      )}
    </div>
  );
}
NewPreprintPreview.propTypes = {
  preprint: PropTypes.object.isRequired
};

function StepPreprint({
  onCancel,
  onStep,
  onIdentifier,
  identifier,
  preprint,
  resolvePreprintStatus
}) {
  const [value, setValue] = useState(unprefix(identifier));

  return (
    <div className="step-preprint">
      <label htmlFor="step-preprint-input">
        Enter a <abbr title="Digital Object Identifier">DOI</abbr> or an arXiv
        ID
      </label>
      <input
        id="step-preprint-input"
        type="text"
        autoComplete="off"
        onChange={e => {
          const value = e.target.value;
          const [arxivId] = identifiersArxiv.extract(value);
          let nextIdentifier;
          if (arxivId) {
            nextIdentifier = `arXiv:${arxivId}`;
          } else {
            const doiMatch = value.match(doiRegex());
            const doi = doiMatch && doiMatch[0];
            if (doi) {
              nextIdentifier = `doi:${doi}`;
            } else {
              nextIdentifier = '';
            }
          }

          if (nextIdentifier !== identifier) {
            onIdentifier(nextIdentifier);
          }

          setValue(value);
        }}
        value={value}
      />

      {preprint ? (
        <NewPreprintPreview preprint={preprint} />
      ) : resolvePreprintStatus.isActive ? (
        <p>{`resolving ${identifier}`}</p>
      ) : resolvePreprintStatus.error ? (
        <p>
          Error:{' '}
          {resolvePreprintStatus.error.message ||
            resolvePreprintStatus.error.name ||
            resolvePreprintStatus.error.statusCode}
        </p>
      ) : null}

      <Controls className="step-preprint__button-bar">
        <Button
          onClick={e => {
            setValue('');
            onIdentifier('');
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={e => {
            onStep('NEW_REQUEST');
          }}
          disabled={!identifier || !preprint}
        >
          Request reviews
        </Button>
        <Button
          onClick={e => {
            onStep('NEW_REVIEW');
          }}
          disabled={!identifier || !preprint}
        >
          Add review
        </Button>
      </Controls>
    </div>
  );
}
StepPreprint.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onStep: PropTypes.func.isRequired,
  onIdentifier: PropTypes.func.isRequired,
  identifier: PropTypes.string,
  preprint: PropTypes.object,
  resolvePreprintStatus: PropTypes.object.isRequired
};

function StepReview({
  identifier,
  preprint,
  onViewInContext,
  onCancel,
  onReviewed
}) {
  const [user] = useUser();
  const [post, postData] = usePostAction();
  const [answerMap, setAnswerMap] = useState({});

  const canSubmit = checkIfAllAnswered(answerMap);

  return (
    <div className="step-review">
      <header>Add a Rapid PREreview</header>

      <NewPreprintPreview preprint={preprint} />

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

        <Controls error={postData.error}>
          <Button
            onClick={e => {
              onCancel();
            }}
            disabled={postData.isActive}
          >
            Go Back
          </Button>
          <Button
            onClick={e => {
              post(
                {
                  '@type': 'RapidPREreviewAction',
                  actionStatus: 'CompletedActionStatus',
                  agent: getId(arrayify(user.hasRole)[0]),
                  object: identifier,
                  resultReview: {
                    '@type': 'RapidPREreviewAction',
                    reviewAnswer: getReviewAnswers(answerMap)
                  }
                },
                body => {
                  onReviewed(body);
                }
              );
            }}
            disabled={postData.isActive || !canSubmit}
          >
            Submit
          </Button>
          <Button
            onClick={e => {
              onViewInContext(identifier, preprint, 'review');
            }}
            disabled={postData.isActive}
          >
            View In Context
          </Button>
        </Controls>
      </form>
    </div>
  );
}
StepReview.propTypes = {
  identifier: PropTypes.string.isRequired,
  preprint: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onReviewed: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};

function StepRequest({
  identifier,
  preprint,
  onViewInContext,
  onCancel,
  onRequested
}) {
  const [post, postData] = usePostAction();

  return (
    <div className="step-request">
      <header>Request reviews</header>

      <NewPreprintPreview preprint={preprint} />

      <Controls>
        <Button
          onClick={e => {
            onCancel();
          }}
          disabled={postData.isActive}
        >
          Go Back
        </Button>
        <Button
          onClick={e => {
            onRequested(postData.body);
          }}
          disabled={postData.isActive}
        >
          Submit
        </Button>
        <Button
          onClick={e => {
            onViewInContext(identifier, preprint, 'request');
          }}
          disabled={postData.isActive}
        >
          View In Context
        </Button>
      </Controls>
    </div>
  );
}
StepRequest.propTypes = {
  identifier: PropTypes.string.isRequired,
  preprint: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRequested: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};
