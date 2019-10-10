import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from './checkbox';

export default function Facets({ counts }) {
  return (
    <div className="facets">
      <section className="facets__section">
        <header className="facets__section-header">Contents</header>
        <ul className="facets__list">
          {!!counts.hasReviews && (
            <li className="facets__list-item">
              <Checkbox
                label={
                  <span className="facets__facet-label">
                    With Reviews <span>{counts.hasReviews.true || 0}</span>
                  </span>
                }
                type="checkbox"
                inputId="counts-reviews"
                name="hasReviews"
              />
            </li>
          )}

          {!!counts.hasReviews && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-reviews-false"
                name="hasNoReview"
                label={
                  <span className="facets__facet-label">
                    Without Reviews <span>{counts.hasReviews.false || 0}</span>
                  </span>
                }
              />
            </li>
          )}

          {!!counts.hasRequests && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-requests"
                name="hasRequests"
                label={
                  <span className="facets__facet-label">
                    With Requests <span>{counts.hasRequests.true || 0}</span>
                  </span>
                }
              />
            </li>
          )}

          {!!counts.hasRequests && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-requests-false"
                name="hasNoRequest"
                label={
                  <span className="facets__facet-label">
                    Without Requests{' '}
                    <span>{counts.hasRequests.false || 0}</span>
                  </span>
                }
              />
            </li>
          )}

          {!!counts.hasData && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-data"
                name="hasData"
                label={
                  <span className="facets__facet-label">
                    With Reported Data <span>{counts.hasData.true || 0}</span>
                  </span>
                }
              />
            </li>
          )}

          {!!counts.hasCode && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-code"
                name="hasCode"
                label={
                  <span className="facets__facet-label">
                    With Reported Code <span>{counts.hasCode.true}</span>
                  </span>
                }
              />
            </li>
          )}
        </ul>
      </section>

      {!!(counts.subjectName && Object.keys(counts.subjectName).length > 0) && (
        <section className="facets__section">
          <header className="facets__section-header">Diseases</header>
          <ul className="facets__list">
            {Object.keys(counts.subjectName).map(subject => (
              <li key={subject} className="facets__list-item">
                <Checkbox
                  inputId={`counts-${subject}`}
                  name={subject}
                  label={
                    <span className="facets__facet-label">
                      {subject} <span>{counts.subjectName[subject]}</span>
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

Facets.propTypes = {
  counts: PropTypes.shape({
    hasReviews: PropTypes.shape({
      true: PropTypes.number,
      false: PropTypes.number
    }),
    hasRequests: PropTypes.shape({
      true: PropTypes.number,
      false: PropTypes.number
    }),
    hasData: PropTypes.shape({
      true: PropTypes.number,
      false: PropTypes.number
    }),
    hasCode: PropTypes.shape({
      true: PropTypes.number,
      false: PropTypes.number
    }),
    subjectName: PropTypes.object
  }).isRequired
};
