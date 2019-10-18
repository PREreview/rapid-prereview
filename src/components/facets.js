import React from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import Checkbox from './checkbox';
import { createPreprintQs } from '../utils/search';

export default function Facets({ counts }) {
  const history = useHistory();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);

  return (
    <div className="facets">
      <section className="facets__section">
        <header className="facets__section-header">Contents</header>
        <ul className="facets__list">
          {'hasReviews' in counts && (
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
                checked={qs.get('reviews') === 'true'}
                onChange={e => {
                  const search = createPreprintQs(
                    {
                      hasReviews: e.target.checked || null
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search
                  });
                }}
              />
            </li>
          )}

          {'hasReviews' in counts && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-reviews-false"
                name="hasNoReview"
                label={
                  <span className="facets__facet-label">
                    Without Reviews <span>{counts.hasReviews.false || 0}</span>
                  </span>
                }
                checked={qs.get('reviews') === 'false'}
                onChange={e => {
                  const search = createPreprintQs(
                    {
                      hasReviews: e.target.checked ? false : null
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search
                  });
                }}
              />
            </li>
          )}

          {'hasRequests' in counts && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-requests"
                name="hasRequests"
                label={
                  <span className="facets__facet-label">
                    With Requests <span>{counts.hasRequests.true || 0}</span>
                  </span>
                }
                checked={qs.get('requests') === 'true'}
                onChange={e => {
                  const search = createPreprintQs(
                    {
                      hasRequests: e.target.checked || null
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search
                  });
                }}
              />
            </li>
          )}

          {'hasRequests' in counts && (
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
                checked={qs.get('requests') === 'false'}
                onChange={e => {
                  const search = createPreprintQs(
                    {
                      hasRequests: e.target.checked ? false : null
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search
                  });
                }}
              />
            </li>
          )}

          {'hasData' in counts && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-data"
                name="hasData"
                label={
                  <span className="facets__facet-label">
                    With Reported Data <span>{counts.hasData.true || 0}</span>
                  </span>
                }
                checked={qs.get('data') === 'true'}
                onChange={e => {
                  const search = createPreprintQs(
                    {
                      hasData: e.target.checked || null
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search
                  });
                }}
              />
            </li>
          )}

          {'hasCode' in counts && (
            <li className="facets__list-item">
              <Checkbox
                inputId="counts-code"
                name="hasCode"
                label={
                  <span className="facets__facet-label">
                    With Reported Code <span>{counts.hasCode.true}</span>
                  </span>
                }
                checked={qs.get('code') === 'true'}
                onChange={e => {
                  const search = createPreprintQs(
                    {
                      hasCode: e.target.checked || null
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search
                  });
                }}
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
                  checked={
                    qs.has('subject') &&
                    qs
                      .get('subject')
                      .split(',')
                      .includes(subject)
                  }
                  onChange={e => {
                    const subjects = qs.has('subject')
                      ? qs.get('subject').split(',')
                      : [];

                    const search = createPreprintQs(
                      {
                        subjects: e.target.checked
                          ? subjects.concat(subject)
                          : subjects.filter(s => s !== subject)
                      },
                      location.search
                    );

                    history.push({
                      pathname: location.pathname,
                      search
                    });
                  }}
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
    hasReviews: PropTypes.oneOfType([
      PropTypes.number, // 0
      PropTypes.shape({
        true: PropTypes.number,
        false: PropTypes.number
      })
    ]),
    hasRequests: PropTypes.oneOfType([
      PropTypes.number, // 0
      PropTypes.shape({
        true: PropTypes.number,
        false: PropTypes.number
      })
    ]),
    hasData: PropTypes.oneOfType([
      PropTypes.number, // 0
      PropTypes.shape({
        true: PropTypes.number,
        false: PropTypes.number
      })
    ]),
    hasCode: PropTypes.oneOfType([
      PropTypes.number, // 0
      PropTypes.shape({
        true: PropTypes.number,
        false: PropTypes.number
      })
    ]),
    subjectName: PropTypes.oneOfType([
      PropTypes.number, // 0
      PropTypes.object
    ])
  }).isRequired
};
