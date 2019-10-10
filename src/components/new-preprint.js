import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
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
import TextInput from './text-input';

export default function NewPreprint({
  onCancel,
  onReviewed,
  onRequested,
  onViewInContext
}) {
  const location = useLocation(); // location.state can be {preprint, tab} with tab being `request` or `review` (so that we know on which tab the shell should be activated with

  const [identifier, setIdentifier] = useState(
    (location.state &&
      location.state.preprint &&
      location.state.preprint.doi) ||
      (location.state &&
        location.state.preprint &&
        location.state.preprint.arXivId) ||
      ''
  );

  const [preprint, resolvePreprintStatus] = usePreprint(
    identifier,
    location.state && location.state.preprint
  );

  const [step, setStep] = useState(
    location.state && location.state.tab === 'review'
      ? 'NEW_REVIEW'
      : location.state && location.state.tab === 'request'
      ? 'NEW_REQUEST'
      : 'NEW_PREPRINT'
  );

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
      <div className="step-preprint__input-row">
        <TextInput
          inputId="step-preprint-input-new"
          label={
            <span>
              {' '}
              Enter a <abbr title="Digital Object Identifier">DOI</abbr> or an
              arXiv ID
            </span>
          }
          minimal={true}
          autoComplete="off"
          placeholder=""
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
        {/* <label
          htmlFor="step-preprint-input"
          className="step-preprint__input-label step-preprint__input-label--large"
        >
          Enter a <abbr title="Digital Object Identifier">DOI</abbr> or an arXiv
          ID
        </label>

        <input
          id="step-preprint-input"
          className="step-preprint__text-input"
          type="text"
          autoComplete="off"
          placeholder=""
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
        /> */}
      </div>

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
  const [answerMap, setAnswerMap] = useState({}); // TODO read from local storage ?

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
                    '@type': 'RapidPREreview',
                    reviewAnswer: getReviewAnswers(answerMap)
                  }
                },
                onReviewed
              );
            }}
            disabled={postData.isActive || !canSubmit}
          >
            Submit
          </Button>
          <Button
            onClick={e => {
              onViewInContext({
                identifier,
                preprint,
                tab: 'review',
                answerMap
              });
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
  const [user] = useUser();
  const [post, postData] = usePostAction();

  return (
    <div className="step-request">
      <header>Request reviews</header>

      <NewPreprintPreview preprint={preprint} />

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
                '@type': 'RequestForRapidPREreviewAction',
                actionStatus: 'CompletedActionStatus',
                agent: getId(arrayify(user.hasRole)[0]),
                object: identifier
              },
              onRequested
            );
          }}
          disabled={postData.isActive}
        >
          Submit
        </Button>
        <Button
          onClick={e => {
            onViewInContext({ identifier, preprint, tab: 'request' });
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
