import React, { useState } from 'react';
import { Route, useHistory, useLocation } from 'react-router-dom';
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

export default function Home() {
  const [user] = useUser();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [results, progress] = usePreprintSearchResults();

  const history = useHistory();
  const location = useLocation();

  return (
    <div className="home">
      <HeaderBar
        onClickMenuButton={() => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />
      <SearchBar />
      <div className="home__main">
        <LeftSidePanel visible={showLeftPanel}>
          <Facets counts={results.counts} />
        </LeftSidePanel>

        <div className="home__content">
          <div className="home__content-header">
            <h3 className="home__content-title">Most Active Preprints</h3>
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
              Add Preprint
            </Button>
          </div>

          <Route path="/new" exact={true}>
            <Modal
              showCloseButton={true}
              title="Add Preprint Review or Request for Review"
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
                  console.log(action);
                  history.push('/');
                }}
                onRequested={action => {
                  console.log(action);
                  history.push('/');
                }}
                onViewInContext={({ identifier, preprint, tab }) => {
                  history.push(`/${unprefix(identifier)}`, {
                    preprint,
                    tab
                  });
                }}
              />
            </Modal>
          </Route>

          {isLoginModalOpen && (
            <LoginRequiredModal
              onClose={() => {
                setIsLoginModalOpen(false);
              }}
            />
          )}

          <SortOptions
            value="score"
            onChange={nextValue => {
              console.log('TODO');
            }}
          />

          <ul className="home__preprint-list">
            {results.rows.map(row => (
              <li key={row.id} className="home__preprint-list__item">
                <PreprintCard
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
        </div>
        <div className="home__main__right"></div>
      </div>
    </div>
  );
}
