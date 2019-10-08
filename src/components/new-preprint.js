import React, { useState } from 'react';
import PropTypes from 'prop-types';
import identifiersArxiv from 'identifiers-arxiv';
import doiRegex from 'doi-regex';
import { format } from 'date-fns';
import { unprefix } from '../utils/jsonld';
import Value from './value';
import { useUser } from '../contexts/user-context';
import { usePostAction, usePreprint } from '../hooks/api-hooks';

// TODO view in context is only available _after_ user selects request or review so that we know under which tab the shell should be open in the extension fallback?
// Also only offer to view in context if we have a PDF URL

export default function NewPreprint({
  onCancel,
  onReviewed,
  onRequested,
  onViewInContext
}) {
  const [user] = useUser();
  const [value, setValue] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [preprint, resolvePreprintStatus] = usePreprint(identifier);
  const [post, postData] = usePostAction();
  const [step, setStep] = useState('NEW_PREPRINT'); // 'NEW_REVIEW' | 'NEW_REQUEST'

  return (
    <div className="new-preprint">
      <label htmlFor="new-preprint-input">
        Enter a <abbr title="Digital Object Identifier">DOI</abbr> or an arXiv
        ID
      </label>
      <input
        id="new-preprint-input"
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
            setIdentifier(nextIdentifier);
          }

          setValue(value);
        }}
        value={value}
      />

      <button
        onClick={e => {
          setValue('');
          setIdentifier('');
          onCancel();
        }}
      >
        Cancel
      </button>

      {preprint ? (
        <div>
          {!!preprint.name && <Value tagName="h2">{preprint.name}</Value>}

          {!!preprint.datePosted && (
            <span>{format(new Date(preprint.datePosted), 'MMM. d, yyyy')}</span>
          )}
          {!!(preprint.preprintServer && preprint.preprintServer.name) && (
            <Value tagName="span">{preprint.preprintServer.name}</Value>
          )}

          {!!identifier && <span>{unprefix(identifier)}</span>}
        </div>
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

      <button
        onClick={e => {
          setStep('NEW_REQUEST');
        }}
        disabled={!identifier || !preprint}
      >
        Request reviews
      </button>
      <button
        onClick={e => {
          setStep('NEW_REVIEW');
        }}
        disabled={!identifier || !preprint}
      >
        Add review
      </button>
      <button
        onClick={e => {
          onViewInContext(identifier, preprint);
        }}
        disabled={!identifier || !preprint}
      >
        View In Context
      </button>
    </div>
  );
}

NewPreprint.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onReviewed: PropTypes.func.isRequired,
  onRequested: PropTypes.func.isRequired,
  onViewInContext: PropTypes.func.isRequired
};
