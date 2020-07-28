import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { DISEASES } from '../constants';
import Checkbox from './checkbox';
import { createPreprintQs } from '../utils/search';
import RangeFacet from './range-facet';

export default function Facets({ counts = {}, ranges = {}, isFetching }) {
  const history = useHistory();
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  return (
    <div className="facets">
      <section className="facets__section">
        <header className="facets__section-header">Number of Reviews</header>

        <RangeFacet
          type="review"
          value={
            params.has('minimumReviews')
              ? params.get('minimumReviews') === 'false'
                ? 0
                : parseInt(params.get('minimumReviews'), 10)
              : null
          }
          range={ranges.nReviews}
          isFetching={isFetching}
          onChange={e => {
            const minReviews = parseInt(e.target.name, 10);

            const search = createPreprintQs(
              {
                nReviews:
                  e.target.name === '0'
                    ? e.target.checked
                      ? 'false'
                      : null
                    : e.target.checked
                    ? minReviews
                    : null
              },
              location.search
            );

            history.push({
              pathname: location.pathname,
              search,
              state: { prevSearch: location.search }
            });
          }}
        />
      </section>

      <section className="facets__section">
        <header className="facets__section-header">Number of Requests</header>

        <RangeFacet
          type="request"
          value={
            params.has('minimumRequests')
              ? params.get('minimumRequests') === 'false'
                ? 0
                : parseInt(params.get('minimumRequests'), 10)
              : null
          }
          range={ranges.nRequests}
          isFetching={isFetching}
          onChange={e => {
            const minRequests = parseInt(e.target.name, 10);

            const search = createPreprintQs(
              {
                nRequests:
                  e.target.name === '0'
                    ? e.target.checked
                      ? 'false'
                      : null
                    : e.target.checked
                    ? minRequests
                    : null
              },
              location.search
            );

            history.push({
              pathname: location.pathname,
              search,
              state: { prevSearch: location.search }
            });
          }}
        />
      </section>

      <section className="facets__section">
        <header className="facets__section-header">Contents</header>
        <ul className="facets__list">
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
              checked={params.get('data') === 'true'}
              onChange={e => {
                const search = createPreprintQs(
                  {
                    hasData: e.target.checked || null
                  },
                  location.search
                );

                history.push({
                  pathname: location.pathname,
                  search,
                  state: { prevSearch: location.search }
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
              checked={params.get('code') === 'true'}
              onChange={e => {
                const search = createPreprintQs(
                  {
                    hasCode: e.target.checked || null
                  },
                  location.search
                );

                history.push({
                  pathname: location.pathname,
                  search,
                  state: { prevSearch: location.search }
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
                  isFetching 
                }
                label={
                  <span className={`facets__facet-label ${subject.featured ? "facets__facet-label-featured" : ""}`}>
                    {subject.alternateName ? (
                      <abbr title={subject.name}>{subject.alternateName}</abbr>
                    ) : (
                        subject.name
                      )}{' '}
                  </span>
                }
                checked={
                  params.has('q') &&
                  params
                    .get('q')
                    .split(',')
                    .includes(subject.alternateName || subject.name)
                }
                onChange={e => {
                  const subjectNames = params.has('subject')
                    ? params.get('subject').split(',')
                    : [];

                  const search = createPreprintQs(
                    {
                      text: e.target.checked
                        ? subjectNames.concat(subject.alternateName ? subject.alternateName : subject.name)
                        : subjectNames.filter(name => name !== subject.alternateName)
                    },
                    location.search
                  );

                  history.push({
                    pathname: location.pathname,
                    search,
                    state: { prevSearch: location.search }
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
    hasOthersRec: PropTypes.oneOfType([
      PropTypes.number, // 0
      PropTypes.shape({
        true: PropTypes.number,
        false: PropTypes.number
      })
    ]),
    hasPeerRec: PropTypes.oneOfType([
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
