import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import omit from 'lodash/omit';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import PrivateRoute from './private-route';
import { usePreprintSearchResults } from '../hooks/api-hooks';
import { useIsNewVisitor, useIsMobile } from '../hooks/ui-hooks';
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
import WelcomeModal from './welcome-modal';
import XLink from './xlink';
import AddButton from './add-button';
import { ORG } from '../constants';

export default function Home() {
  const history = useHistory();
  const location = useLocation();

  const [user] = useUser();
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isNewVisitor = useIsNewVisitor();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);

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
      <Helmet>
        <title>{ORG} • Home</title>
      </Helmet>

      {!!(
        (isNewVisitor || new URLSearchParams(location.search).get('welcome')) &&
        isWelcomeModalOpen
      ) && (
        <WelcomeModal
          onClose={() => {
            setIsWelcomeModalOpen(false);
          }}
        />
      )}
      <HeaderBar
        onClickMenuButton={e => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />

      <SearchBar isFetching={fetchResultsProgress.isActive} />

      <div className="home__main">
        <LeftSidePanel
          visible={showLeftPanel}
          onClickOutside={() => {
            setShowLeftPanel(false);
          }}
        >
          <Facets
            counts={results.counts}
            isFetching={fetchResultsProgress.isActive}
          />
        </LeftSidePanel>

        <div className="home__content">
          <div className="home__content-header">
            <h3 className="home__content-title">
              Preprints with reviews or requests for reviews
            </h3>
            <AddButton
              onClick={e => {
                if (user) {
                  history.push('/new');
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              disabled={location.pathname === '/new'}
            />
          </div>

          <PrivateRoute path="/new" exact={true}>
            <Modal
              showCloseButton={true}
              title="Add Entry"
              onClose={() => {
                history.push('/');
              }}
            >
              <Helmet>
                <title>Rapid PREreview • Add entry</title>
              </Helmet>
              <NewPreprint
                onCancel={() => {
                  history.push('/');
                }}
                onSuccess={() => {
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
                <XLink to={location.pathname} href={location.pathname}>
                  Clear search terms.
                </XLink>
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
                          tab: 'request',
                          isSingleStep: true
                        });
                      } else {
                        setIsLoginModalOpen(true);
                      }
                    }}
                    onNew={preprint => {
                      if (user) {
                        history.push('/new', {
                          preprint: omit(preprint, ['potentialAction'])
                        });
                      } else {
                        setIsLoginModalOpen(true);
                      }
                    }}
                    onNewReview={preprint => {
                      if (user) {
                        history.push('/new', {
                          preprint: omit(preprint, ['potentialAction']),
                          tab: 'review',
                          isSingleStep: true
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
            {!!(location.state && location.state.bookmark) && (
              <Button
                onClick={() => {
                  history.push({
                    pathname: location.pathame,
                    search: createPreprintQs({}, location.search)
                  });
                }}
              >
                <MdFirstPage /> First page
              </Button>
            )}
            {/* Cloudant returns the same bookmark when it hits the end of the list */}
            {!!(
              results.rows.length < results.total_rows &&
              results.bookmark !== (location.state && location.state.bookmark)
            ) && (
              <Button
                className="home__next-page-button"
                onClick={() => {
                  history.push({
                    pathname: location.pathame,
                    search: createPreprintQs({}, location.search),
                    state: { bookmark: results.bookmark }
                  });
                }}
              >
                Next Page <MdChevronRight />
              </Button>
            )}
          </div>
        </div>

        <div className="home__main__right"></div>
      </div>
    </div>
  );
}
