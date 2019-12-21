import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { DISEASES } from '../constants';
import Checkbox from './checkbox';
import { createPreprintQs } from '../utils/search';

export default function Facets({ counts = {}, ranges = {}, isFetching }) {
  const history = useHistory();
  const location = useLocation();

  const qs = new URLSearchParams(location.search);

  return (
    <div className="facets">
      <section className="facets__section">
        <header className="facets__section-header">Contents</header>
        <ul className="facets__list">
          {/*
          <li className="facets__list-item">
            <Checkbox
              label={
                <span className="facets__facet-label">
                  With Reviews{' '}
                  <Count
                    value={(counts.hasReviews || {}).true || 0}
                    isFetching={isFetching}
                  />
                </span>
              }
              type="checkbox"
              inputId="counts-reviews"
              name="hasReviews"
              disabled={isFetching || !(counts.hasReviews || {}).true}
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
          </li>*/}

          <li className="facets__list-item">
            <Checkbox
              label={
                <span className="facets__facet-label">
                  <span>
                    With{' '}
                    <input
                      type="number"
                      value={qs.get('minimumReviews') || 3}
                    />
                    + reviews{' '}
                  </span>
                  <Count
                    value={(ranges.nReviews || {}).minimum || 0}
                    isFetching={isFetching}
                  />
                </span>
              }
              type="checkbox"
              inputId="counts-minimumReviews"
              name="nReviews"
              disabled={
                isFetching || ((ranges.nReviews || {}).minimum || 0) === 0
              }
              checked={qs.has('minimumReviews')}
              onChange={e => {
                const search = createPreprintQs(
                  {
                    nReviews: e.target.checked ? 3 : null
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

          <li className="facets__list-item">
            <Checkbox
              label={
                <span className="facets__facet-label">
                  <span>
                    With{' '}
                    <input
                      type="number"
                      value={qs.get('minimumReviews') || 1}
                    />
                    + requests{' '}
                  </span>
                  <Count
                    value={(ranges.nReviews || {}).minimum || 0}
                    isFetching={isFetching}
                  />
                </span>
              }
              type="checkbox"
              inputId="counts-minimumReviews"
              name="nReviews"
              disabled={
                isFetching || ((ranges.nReviews || {}).minimum || 0) === 0
              }
              checked={qs.has('minimumReviews')}
              onChange={e => {
                const search = createPreprintQs(
                  {
                    nReviews: e.target.checked ? 3 : null
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

          {/*
              <li className="facets__list-item">
              <Checkbox
              inputId="counts-reviews-false"
              name="hasNoReview"
              disabled={isFetching || !(counts.hasReviews || {}).false}
              label={
              <span className="facets__facet-label">
              Without Reviews{' '}
              <Count
              value={(counts.hasReviews || {}).false || 0}
              isFetching={isFetching}
              />
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
              </li>*/}

          {/*
              <li className="facets__list-item">
              <Checkbox
              inputId="counts-requests"
              name="hasRequests"
              label={
              <span className="facets__facet-label">
              With Requests{' '}
              <Count
              value={(counts.hasRequests || {}).true || 0}
              isFetching={isFetching}
              />
              </span>
              }
              disabled={isFetching || !(counts.hasRequests || {}).true}
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
              </li>*/}

          {/*
              <li className="facets__list-item">
              <Checkbox
              inputId="counts-requests-false"
              name="hasNoRequest"
              label={
              <span className="facets__facet-label">
              Without Requests{' '}
              <Count
              value={(counts.hasRequests || {}).false || 0}
              isFetching={isFetching}
              />
              </span>
              }
              disabled={isFetching || !(counts.hasRequests || {}).false}
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
              </li>*/}

          <li className="facets__list-item">
            <Checkbox
              inputId="counts-data"
              name="hasData"
              label={
                <span className="facets__facet-label">
                  With Reported Data{' '}
                  <Count
                    value={(counts.hasData || {}).true || 0}
                    isFetching={isFetching}
                  />
                </span>
              }
              disabled={isFetching || !(counts.hasData || {}).true}
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

          <li className="facets__list-item">
            <Checkbox
              inputId="counts-code"
              name="hasCode"
              label={
                <span className="facets__facet-label">
                  With Reported Code{' '}
                  <Count
                    value={(counts.hasCode || {}).true || 0}
                    isFetching={isFetching}
                  />
                </span>
              }
              disabled={isFetching || !(counts.hasCode || {}).true}
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
        </ul>
      </section>

      <section className="facets__section">
        <header className="facets__section-header">Diseases</header>
        <ul className="facets__list">
          {DISEASES.map(subject => (
            <li key={subject.name} className="facets__list-item">
              <Checkbox
                inputId={`counts-${subject.alternateName || subject.name}`}
                name={subject.name}
                disabled={
                  isFetching || !(counts.subjectName || {})[subject.name]
                }
                label={
                  <span className="facets__facet-label">
                    {subject.alternateName ? (
                      <abbr title={subject.name}>{subject.alternateName}</abbr>
                    ) : (
                      subject.name
                    )}{' '}
                    <Count
                      value={(counts.subjectName || {})[subject.name] || 0}
                      isFetching={isFetching}
                    />
                  </span>
                }
                checked={
                  qs.has('subject') &&
                  qs
                    .get('subject')
                    .split(',')
                    .includes(subject.name)
                }
                onChange={e => {
                  const subjectNames = qs.has('subject')
                    ? qs.get('subject').split(',')
                    : [];

                  const search = createPreprintQs(
                    {
                      subjects: e.target.checked
                        ? subjectNames.concat(subject.name)
                        : subjectNames.filter(name => name !== subject.name)
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
    </div>
  );
}

Facets.propTypes = {
  isFetching: PropTypes.bool,
  ranges: PropTypes.shape({
    nReviews: PropTypes.shape({
      minimum: PropTypes.number
    })
  }),
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
  })
};

function Count({ value, isFetching }) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  const prevValue = ref.current;

  return (
    <span
      className={classNames('count', {
        'count--loading': isFetching
      })}
    >
      {isFetching ? prevValue : value}
    </span>
  );
}
Count.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired
};
