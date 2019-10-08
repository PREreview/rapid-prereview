import React, { useState, useEffect } from 'react';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import LeftSidePanel from './left-side-panel';
import PreprintCard from './preprint-card';
import Facets from './facets';
import NewPreprint from './new-preprint';
import Modal from './modal';

export default function Home() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [results, setResults] = useState({
    bookmark: null,
    rows: [],
    total_rows: 0,
    counts: {}
  });

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      const r = await fetch(
        `/api/preprint?q=*:*&sort=${JSON.stringify([
          '-score<number>',
          '-datePosted<number>'
        ])}&include_docs=true&counts=${JSON.stringify([
          'hasData',
          'hasCode',
          'hasReviews',
          'hasRequests',
          'subjectName'
        ])}`
      );
      if (r.ok) {
        const results = await r.json();
        setResults(results);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="home">
      <HeaderBar
        onClickMenuButton={() => {
          console.log('toggle');
          setShowLeftPanel(!showLeftPanel);
        }}
      />
      <SearchBar />
      <div className="home__main">
        <LeftSidePanel visible={showLeftPanel}>
          <Facets counts={results.counts} />
        </LeftSidePanel>

        <div className="home__content">
          <button
            onClick={e => {
              history.push('/new');
            }}
            disabled={location.pathname === '/new'}
          >
            Start
          </button>

          <Route path="/new" exact={true}>
            <Modal>
              <NewPreprint
                onCancel={() => {
                  history.push('/');
                }}
                onReviewed={() => {
                  history.push('/');
                }}
                onRequested={() => {
                  history.push('/');
                }}
                onViewInContext={(identifier, preprint) => {
                  history.push(`/${unprefix(identifier)}`, preprint);
                }}
              />
            </Modal>
          </Route>

          <ul className="home__preprint-list">
            {results.rows.map(row => (
              <li key={row.id} className="home__preprint-list__item">
                <PreprintCard preprint={row.doc} />
              </li>
            ))}
          </ul>
        </div>
        <div className="home__main__right"></div>
      </div>
    </div>
  );
}
