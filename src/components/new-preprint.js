import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import identifiersArxiv from 'identifiers-arxiv';
import doiRegex from 'doi-regex';
import { format } from 'date-fns';
import { MdChevronRight } from 'react-icons/md';
import Value from './value';
import { createPreprintIdentifierCurie, createPreprintId } from '../utils/ids';
import { getId, unprefix, cleanup } from '../utils/jsonld';
import { usePostAction, usePreprint } from '../hooks/api-hooks';
import { useLocalState } from '../hooks/ui-hooks';
import SubjectEditor from './subject-editor';
import RapidFormFragment from './rapid-form-fragment';
import { useUser } from '../contexts/user-context';
import { getReviewAnswers, checkIfAllAnswered } from '../utils/actions';
import Controls from './controls';
import Button from './button';
import TextInput from './text-input';
import { getDefaultRole } from '../utils/users';

export default function NewPreprint({
  onCancel,
  onReviewed,
  onRequested,
  onViewInContext
}) {
  const location = useLocation(); // location.state can be {preprint, tab, isSingleStep} with tab being `request` or `review` (so that we know on which tab the shell should be activated with

  const isSingleStep = location.state && location.state.isSingleStep;

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
      ) : preprint && step === 'NEW_REVIEW' ? (
        <StepReview
          isSingleStep={isSingleStep}
          onCancel={e => {
            if (isSingleStep) {
              onCancel();
            } else {
              setStep('NEW_PREPRINT');
            }
          }}
          preprint={preprint}
          onReviewed={onReviewed}
          onViewInContext={onViewInContext}
        />
      ) : preprint && step === 'NEW_REQUEST' ? (
        <StepRequest
          isSingleStep={isSingleStep}
          onCancel={e => {
            if (isSingleStep) {
              onCancel();
            } else {
              setStep('NEW_PREPRINT');
            }
          }}
          preprint={preprint}
          onRequested={onRequested}
          onViewInContext={onViewInContext}
        />
      ) : null}
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
    <div className="new-preprint__preview">
      <div className="new-preprint__preview__header">
        {!!preprint.name && (
          <Value className="new-preprint__preview__title" tagName="h2">
            {preprint.name}
          </Value>
        )}

        {!!preprint.datePosted && (
          <span className="new-preprint__preview__date">
            {format(new Date(preprint.datePosted), 'MMM. d, yyyy')}
          </span>
        )}
      </div>
      <div className="new-preprint__preview__info">
        {!!(preprint.preprintServer && preprint.preprintServer.name) && (
          <Value className="new-preprint__preview__server" tagName="span">
            {preprint.preprintServer.name}
          </Value>
        )}
        <MdChevronRight className="new-preprint__preview__server-arrow-icon" />
        {!!(preprint.doi || preprint.arXivId) && (
          <span className="new-preprint__preview__id">
            {preprint.doi || preprint.arXivId}
          </span>
        )}
      </div>
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
    <div className="new-preprint__step-preprint">
      <div className="new-preprint__input-row">
        <TextInput
          inputId="step-preprint-input-new"
          label={
            <span>
              Enter preprint <abbr title="Digital Object Identifier">DOI</abbr>{' '}
              or an arXiv ID
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
              nextIdentifier = arxivId;
            } else {
              const doiMatch = value.match(doiRegex());
              const doi = doiMatch && doiMatch[0];
              if (doi) {
                nextIdentifier = doi;
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

      <Controls className="new-preprint__button-bar">
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
  preprint,
  onViewInContext,
  onCancel,
  onReviewed,
  isSingleStep
}) {
  const [user] = useUser();
  const [post, postData] = usePostAction();
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
    <div className="new-preprint__step-review">
      <header className="new-preprint__title">Add a Rapid PREreview</header>

      <NewPreprintPreview preprint={preprint} />

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

        <Controls error={postData.error} className="new-preprint__button-bar">
          <Button
            onClick={e => {
              onCancel();
            }}
            disabled={postData.isActive}
          >
            {isSingleStep ? 'Cancel' : 'Go Back'}
          </Button>
          <Button
            onClick={e => {
              post(
                {
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
                preprint,
                tab: 'review'
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
  isSingleStep: PropTypes.bool,
  preprint: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onReviewed: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};

function StepRequest({
  isSingleStep,
  preprint,
  onViewInContext,
  onCancel,
  onRequested
}) {
  const [user] = useUser();
  const [post, postData] = usePostAction();

  return (
    <div className="new-preprint__step-request">
      <header className="new-preprint__title">Confirm Review Request</header>

      <NewPreprintPreview preprint={preprint} />

      <Controls error={postData.error} className="new-preprint__button-bar">
        <Button
          onClick={e => {
            onCancel();
          }}
          disabled={postData.isActive}
        >
          {isSingleStep ? 'Cancel' : 'Go Back'}
        </Button>
        <Button
          onClick={e => {
            post(
              {
                '@type': 'RequestForRapidPREreviewAction',
                actionStatus: 'CompletedActionStatus',
                agent: getId(getDefaultRole(user)),
                object: createPreprintIdentifierCurie(preprint)
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
            onViewInContext({ preprint, tab: 'request' });
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
  isSingleStep: PropTypes.bool,
  preprint: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRequested: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};

function StepReviewSuccess({ preprint, onClose }) {
  return (
    <div className="new-preprint__step-review-success">
      <header className="new-preprint__title">Success</header>

      <NewPreprintPreview preprint={preprint} />

      <p>Your review have been successfully posted.</p>

      <Controls>
        <Button onClick={onClose}>Close</Button>
      </Controls>
    </div>
  );
}
StepReviewSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

function StepRequestSuccess({ preprint, onClose }) {
  return (
    <div className="new-preprint__step-review-success">
      <header className="new-preprint__title">Success</header>

      <NewPreprintPreview preprint={preprint} />

      <p>Your request have been successfully posted.</p>

      <Controls>
        <Button onClick={onClose}>Close</Button>
      </Controls>
    </div>
  );
}
StepRequestSuccess.propTypes = {
  preprint: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};
