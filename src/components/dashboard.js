// base imports
import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ORG } from '../constants';
import Org from './org';

// hooks
import { useActionsSearchResults, usePreprintActions } from '../hooks/api-hooks';

// utils
import { checkIfIsModerated } from '../utils/actions';
import { getId } from '../utils/jsonld';
import { getTags, getReviewerStats } from '../utils/stats';
import { createActivityQs } from '../utils/search';

// contexts
import { useUser } from '../contexts/user-context';

// modules
import AddButton from './add-button';
import Banner from "./banner.js"
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import TagPill from './tag-pill';
import Tooltip from '@reach/tooltip';

import PreprintCard from './preprint-card';
import SortOptions from './sort-options';


const subjects = ['vaccine', 'mask', 'antibody'];

export default function Dashboard() {
  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);

  const [preprints, setPreprints] = useState([])

  const [user] = useUser();

  // fetch all preprints with  covid-19 in the title
  // endpoint would look something like https://outbreaksci.prereview.org/api/preprint?q=name%3ACOVID-19&include_docs=true

  useEffect(() => {
    fetchPreprints();
  }, []);

  const fetchPreprints = async () => {
    const response = await fetch(`http://localhost:3000/api/preprint?q=name%3ACOVID-19&include_docs=true`)
    const data = await response.json();
    setPreprints(data.rows)
  }  
  /**
   * builds an array of action objects from each preprint, 
   * where each item of the array has actions from each preprint
   * */ 
  let actions = [] 
  preprints.length ? actions = preprints.map(preprint => {
    return {
      preprint: preprint.doc,
      actions: preprint.doc.potentialAction
    }
  })
  : actions = []
  
  /**
   * adding the preprint info to each action, 
   * and pushing each individual action to a new array
   */ 
  let allActions = []
  actions.forEach( setOfActions => setOfActions.actions.forEach( action => {
    action["preprint"] = object.preprint
    allActions.push(action)
  }))
  

  // // find preprints that are recommended to others and for peer review 

  // actions.forEach( set => set.actions.forEach(action => ))

  // TODO: figure out if it's enough to search just the titles/names
  // TODO: how to incorporate subjects, as well
  // TODO: create shortcuts for potentially common searches, e.g. masks, etc

  // find preprints that are recommended to others and for peer review
  // const { recdToOthers, recdForPeers } = getTags(safeActions)

  // sort actions to populate a "Recent activity" section
  

  // get active reviewers

  return (
    <div className="toc-page">
      <Helmet>
        <title>{ORG} • Dashboard </title>
      </Helmet>
      <Banner />
      <HeaderBar
        onClickMenuButton={() => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />
      <article className="toc-page__main">
        <div className="toc-page__body">
        <h1 id="Dashboard">Dashboard</h1>
          <section className="dashboard home__main">
            <SearchBar />
            <div className="preprint-card dashboard__tags">
              <ul className="preprint-card__tag-list dashboard__list">
                {subjects.map(subject => (
                  <li key={subject} className="preprint-card__tag-list__item dashboard__list_item">
                    <Tooltip
                      label={`Majority of reviewers tagged with ${subject}`}
                    >
                      <div>
                        <TagPill>{subject}</TagPill>
                      </div>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dashboard__flex">
              <div className="dashboard__flex_item">
                <h2 className="dashboard__h2">Most Recommended</h2>
                <label className="vh" for="reviewer-type">Choose a category:</label>
                <div className="dashboard__options">
                  <div className="dashboard__options_item">
                    <select name="reviewers" id="reviewer-type">
                        <option value="all">All</option>
                        <option value="others">To others</option>
                        <option value="peerreview">For peer reviewers</option>
                    </select>
                  </div>
                  <div className="dashboard__options_item">
                    <div className="dashboard__checkbox">
                      <label for="data">Contains reported data</label>
                      <input type="checkbox" id="data" name="data" />
                    </div>
                    <div className="dashboard__checkbox">
                      <label for="data">Contains reported code</label>
                      <input type="checkbox" id="code" name="code" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="dashboard__flex_item">
                <AddButton
                  onClick={e => {
                    if (user) {
                      history.push('/new');
                    } else {
                      setLoginModalOpenNext('/new');
                    }
                  }}
                  disabled={location.pathname === '/new'}
                />
              </div>
            </div>
            <ul className="home__preprint-list">
              {results.rows.map(row => (
                <li key={row.id} className="home__preprint-list__item">
                  <PreprintCard
                    isNew={false}
                    user={user}
                    preprint={row.doc}
                    onNewRequest={handleNewRequest}
                    onNew={handleNew}
                    onNewReview={handleNewReview}
                    hoveredSortOption={hoveredSortOption}
                    sortOption={params.get('sort') || 'score'}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  )
}
