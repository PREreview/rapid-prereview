import React from 'react';
import PropTypes from 'prop-types';
import { MdChevronRight } from 'react-icons/md';
import Value from './value';
import { getFormattedDatePosted } from '../utils/preprints';

export default function PreprintPreview({ preprint }) {
  return (
    <div className="preprint-preview">
      <div className="preprint-preview__header">
        {!!preprint.name && (
          <Value className="preprint-preview__title" tagName="h2">
            {preprint.name}
          </Value>
        )}

        {!!preprint.datePosted && (
          <span className="preprint-preview__date">
            {getFormattedDatePosted(preprint.datePosted)}
          </span>
        )}
      </div>
      <div className="preprint-preview__info">
        {!!(preprint.preprintServer && preprint.preprintServer.name) && (
          <Value className="preprint-preview__server" tagName="span">
            {preprint.preprintServer.name}
          </Value>
        )}
        <MdChevronRight className="preprint-preview__server-arrow-icon" />
        {!!(preprint.doi || preprint.arXivId) && (
          <span className="preprint-preview__id">
            {preprint.doi ? (
              <a
                href={`https://doi.org/${preprint.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {preprint.doi}
              </a>
            ) : (
              <a
                href={`https://arxiv.org/abs/${preprint.arXivId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {preprint.arXivId}
              </a>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
PreprintPreview.propTypes = {
  preprint: PropTypes.object.isRequired
};
