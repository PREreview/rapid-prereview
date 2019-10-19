import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import PrivateRoute from './private-route';
import omit from 'lodash/omit';
import { usePreprintSearchResults } from '../hooks/api-hooks';
import { useUser } from '../contexts/user-context';
import { unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import LeftSidePanel from './left-side-panel';
import PreprintCard from './preprint-card';
import Facets from './facets';
import SortOptions from './sort-options';
import NewPreprint from './new-preprint';
import Modal from './modal';
import Button from './button';
import LoginRequiredModal from './login-required-modal';
import { createPreprintQs, apifyPreprintQs } from '../utils/search';

export default function Home() {
  const history = useHistory();
  const location = useLocation();

  const [user] = useUser();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const apiQs = apifyPreprintQs(
    location.search,
    location.state && location.state.bookmark
  );
  const [results, fetchResultsProgress] = usePreprintSearchResults(apiQs);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [apiQs]);

  return (
    <div className="home">
      <HeaderBar
        onClickMenuButton={() => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />

      <SearchBar key={apiQs} isFetching={fetchResultsProgress.isActive} />

      <div className="home__main">
        <LeftSidePanel visible={showLeftPanel}>
          <Facets
            counts={results.counts}
            isFetching={fetchResultsProgress.isActive}
          />
        </LeftSidePanel>

        <div className="home__content">
          <div className="home__content-header">
            <h3 className="home__content-title">
              {/* Was 'Most Active Preprints" but this break with the sorting (or need to be adapted) */}
              Preprints with reviews or requests for reviews
            </h3>
            <Button
              pill={true}
              primary={true}
              onClick={e => {
                if (user) {
                  history.push('/new');
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              disabled={location.pathname === '/new'}
            >
              Add Entry
            </Button>
          </div>

          <PrivateRoute path="/new" exact={true}>
            <Modal
              showCloseButton={true}
              title="Add Entry"
              onClose={() => {
                history.push('/');
              }}
            >
              <NewPreprint
                onCancel={() => {
                  // TODO clear local storage entry ?
                  history.push('/');
                }}
                onReviewed={action => {
                  history.push('/');
                }}
                onRequested={action => {
                  history.push('/');
                }}
                onViewInContext={({ preprint, tab }) => {
                  history.push(
                    `/${unprefix(preprint.doi || preprint.arXivId)}`,
                    {
                      preprint: omit(preprint, ['potentialAction']),
                      tab
                    }
                  );
                }}
              />
            </Modal>
          </PrivateRoute>

          {isLoginModalOpen && (
            <LoginRequiredModal
              onClose={() => {
                setIsLoginModalOpen(false);
              }}
            />
          )}

          <SortOptions
            value={new URLSearchParams(location.search).get('sort') || 'score'}
            onChange={(
              nextValue // `score` | `new` | `date`
            ) => {
              const search = createPreprintQs(
                { sort: nextValue },
                location.search
              );
              history.push({
                pathname: location.pathame,
                search
              });
            }}
          />

          {/* TODO 0 result case + loading  */}
          {results.total_rows === 0 && !fetchResultsProgress.isActive ? (
            <div>
              No results found.{' '}
              {!!apiQs && (
                <Link to={location.pathname}>Clear search terms.</Link>
              )}
            </div>
          ) : results.bookmark ===
            (location.state && location.state.bookmark) ? (
            <div>No more results.</div>
          ) : (
            <ul className="home__preprint-list">
              {results.rows.map(row => (
                <li key={row.id} className="home__preprint-list__item">
                  <PreprintCard
                    user={user}
                    preprint={row.doc}
                    onNewRequest={preprint => {
                      if (user) {
                        history.push('/new', {
                          preprint: omit(preprint, ['potentialAction']),
                          tab: 'request'
                        });
                      } else {
                        setIsLoginModalOpen(true);
                      }
                    }}
                    onNewReview={preprint => {
                      if (user) {
                        history.push('/new', {
                          preprint: omit(preprint, ['potentialAction']),
                          tab: 'review'
                        });
                      } else {
                        setIsLoginModalOpen(true);
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="home__pagination">
            {/* Cloudant returns the same bookmark when it hits the end of the list */}
            {!!(
              results.rows.length < results.total_rows &&
              results.bookmark !== (location.state && location.state.bookmark)
            ) && (
              <Button
                onClick={() => {
                  history.push({
                    pathname: location.pathame,
                    search: createPreprintQs(
                      { bookmark: results.bookmark },
                      location.search
                    ),
                    state: { bookmark: results.bookmark }
                  });
                }}
              >
                Next page
              </Button>
            )}

            {!!(location.state && location.state.bookmark) && (
              <Button
                onClick={() => {
                  history.push({
                    pathname: location.pathame,
                    search: createPreprintQs(
                      { bookmark: null },
                      location.search
                    )
                  });
                }}
              >
                Back to first page
              </Button>
            )}
          </div>
        </div>
        <div className="home__main__right"></div>
      </div>
    </div>
  );
}
