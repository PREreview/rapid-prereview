// base imports
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import omit from 'lodash/omit';
import { subDays } from 'date-fns'
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import { useHistory, useLocation } from 'react-router-dom';

import { ORG } from '../constants';
import Org from './org';

// hooks
import { usePreprintSearchResults } from '../hooks/api-hooks';

// utils
import { checkIfIsModerated } from '../utils/actions';
import { getUsersRank, isYes } from '../utils/stats';
import { createPreprintQs, apifyPreprintQs } from '../utils/search';
import { getId } from '../utils/jsonld'


// contexts
import { useUser } from '../contexts/user-context';

// modules
import AddButton from './add-button';
import Banner from "./banner.js";
import Button from './button';

import Checkbox from './checkbox';
import SortOptions from './sort-options';
import HeaderBar from './header-bar';
import PreprintCard from './preprint-card';
import SearchBar from './search-bar';
import XLink from './xlink';
import RecentActivity from './recent-activity'
import ActiveUser from './active-user'


export default function Dashboard() {
  const history = useHistory();
  const location = useLocation();
  const [user] = useUser();

  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);

  const apiQs = apifyPreprintQs(
    location.search,
    location.state && location.state.bookmark
  );

  const params = new URLSearchParams(location.search);

  useEffect(() => {
    if (location.search === "") {
      history.replace({ search: "q=COVID-19" })
    }
  }, [apiQs]);

  const [preprints, fetchResultsProgress] = usePreprintSearchResults(apiQs);

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  const [filters, setFilters] = useState({
    hasCode: false,
    hasData: false,
    recToOthers: false,
    recForPeerReview: false
  })

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: !filters[e.target.name]
    })
  }

  // calculating tags, following the logic in utils/stats
  preprints.rows.length ? preprints.rows.map(preprint => {
      let codeCount = 0
      let dataCount = 0
      let othersCount = 0
      let peerCount = 0
      let reviewCount = 0

      preprint.doc.potentialAction.forEach(action => {
        if (!checkIfIsModerated(action) && action.resultReview && action.resultReview.reviewAnswer) {
        reviewCount += 1

        const answers = action.resultReview.reviewAnswer;

        for (let i = 0; i < answers.length; i++) {
          const answer = answers[i];
          if (answer.parentItem) {
            const questionId = getId(answer.parentItem);
            if (questionId === 'question:ynAvailableCode' && isYes(answer)) {
              // Is the code used in the manuscript available?
              codeCount += 1
            }
            if (questionId === 'question:ynPeerReview' && isYes(answer)) {
              // Do you recommend this manuscript for peer review?
              peerCount += 1
            }
            if (questionId === 'question:ynAvailableData' && isYes(answer)) {
              // Are the data used in the manuscript available?
              dataCount += 1
            }
            if (questionId === 'question:ynRecommend' && isYes(answer)) {
             // Would you recommend this manuscript to others?
              othersCount += 1
            }
          }
        }
      }
    })

    // majority rule calculation
    const threshold = Math.ceil(reviewCount / 2)

    preprint.doc.hasCode = codeCount > 0 && codeCount >= threshold;
    preprint.doc.hasData = dataCount > 0 && dataCount >= threshold;
    preprint.doc.recToOthers = othersCount > 0 && othersCount >= threshold;
    preprint.doc.recForPeerReview = peerCount > 0 && peerCount >= threshold;
  }) : null

  // filtering preprints to render
  const filteredPreprints = () => {

    return preprints.rows.filter(preprint => {
      if (filters.hasCode && !preprint.doc.hasCode) {
        return false
      }
      if (filters.hasData && !preprint.doc.hasData) {
        return false
      }
      if (filters.recToOthers && !preprint.doc.recToOthers) {
        return false
      }
      if (filters.recForPeerReview && !preprint.doc.recForPeerReview) {
        return false
      }
      return true
    })
  }

  useEffect(() => {
    filteredPreprints()
  }, [filters])

  /**
   * builds an array where each item of the array is an object with an 'actions' key,
   * the value to which are all of actions from each preprint
   * */
  let allActions = []
  preprints.rows.length ? allActions = preprints.rows.map(preprint => {
    return {
      preprint: preprint.doc, // details of each preprint
      actions: preprint.doc.potentialAction
    }
  })
    : allActions = []

  /**
   * adding the preprint info to each action,
   * and pushing each individual action to a new array
   */
  let justActions = [];
  allActions.forEach(setOfActions => setOfActions.actions.forEach(action => {
    action["preprint"] = setOfActions.preprint
    justActions.push(action)
  }))

  const safeActions = useMemo(() => {
    return justActions.filter(
      action =>
        !checkIfIsModerated(action) &&
        (action['@type'] === 'RequestForRapidPREreviewAction' ||
          action['@type'] === 'RapidPREreviewAction')
    );
  }, [justActions]);

  // filtering actions for ones that happened within the last week
  const recentActions = safeActions ? safeActions.filter(action => new Date(action.startTime) >= subDays(new Date(), 7)) : []

  // sort recent actions to populate a "Recent activity" section,
  // but sorts all actions if none occurred in the last week
  const sortedActions = recentActions.length ? recentActions.slice(0, 15).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) : safeActions ? safeActions.slice(0, 15).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) : null

  // gets active users, ranked by number of requests+reviews
  const rankedUsers = getUsersRank(safeActions ? safeActions : [])

  // gets 10 of the top users, just their user ids
  const justUsers = rankedUsers.slice(0, 10).map(user => user[0])

  // next three functions copied from home.js
  const handleNewRequest = useCallback(
    preprint => {
      if (user) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction']),
          tab: 'request',
          isSingleStep: true
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}&tab=request`
        );
      }
    },
    [user, history]
  );

  const handleNew = useCallback(
    preprint => {
      if (user) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction'])
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}`
        );
      }
    },
    [user, history]
  );

  const handleNewReview = useCallback(
    preprint => {
      if (user) {
        history.push('/new', {
          preprint: omit(preprint, ['potentialAction']),
          tab: 'review',
          isSingleStep: true
        });
      } else {
        setLoginModalOpenNext(
          `/new?identifier=${preprint.doi || preprint.arXivId}&tab=review`
        );
      }
    },
    [user, history]
  );

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
          <section className="dashboard home__main">
          <h1 id="Dashboard">COVID-19 Dashboard</h1>
            <SearchBar isFetching={fetchResultsProgress.isActive} />
            <div className="dashboard__flex">
              <div className="dashboard__flex_item">
                <p>Filter by:</p>
                <div className="dashboard__options">
                  <div className="dashboard__options_item">
                    <Checkbox
                      inputId="counts-others"
                      name="recToOthers"
                      label={
                        <span className="facets__facet-label">
                          Recommended to others{' '}
                        </span>
                      }
                      // disabled={!(counts.hasData || {}).true}
                      checked={filters['recToOthers']}
                      onChange={e => handleFilterChange(e)}
                    />
                  </div>
                  <div className="dashboard__options_item">
                    <Checkbox
                      inputId="counts-peer"
                      name="recForPeerReview"
                      label={
                        <span className="facets__facet-label">
                          Recommended for peer review{' '}
                        </span>
                      }
                      // disabled={!(counts.hasData || {}).true}
                      checked={filters['recForPeerReview']}
                      onChange={e => handleFilterChange(e)}
                    />
                  </div>
                  <div className="dashboard__options_item">
                    <Checkbox
                      inputId="counts-data"
                      name="hasData"
                      label={
                        <span className="facets__facet-label">
                          With reported data{' '}
                        </span>
                      }
                      // disabled={!(counts.hasData || {}).true}
                      checked={filters['hasData']}
                      onChange={e => handleFilterChange(e)}
                    />
                  </div>
                  <div className="dashboard__options_item">
                    <Checkbox
                      inputId="counts-code"
                      name="hasCode"
                      label={
                        <span className="facets__facet-label">
                          With reported code{' '}
                        </span>
                      }
                      // disabled={!(counts.hasCode || {}).true}
                      checked={filters['hasCode']}
                      onChange={e=>handleFilterChange(e)}
                    />
                  </div>
                </div>
                <SortOptions
                  value={params.get('sort') || 'score'}
                  onMouseEnterSortOption={sortOption => {
                    setHoveredSortOption(sortOption);
                  }}
                  onMouseLeaveSortOption={sortOption => {
                    setHoveredSortOption(null);
                  }}
                  onChange={(
                    nextSortOption // `score` | `new` | `date`
                  ) => {
                    const search = createPreprintQs(
                      {
                        text: 'COVID-19' || 'coronavirus' || 'SARS-CoV2',
                        sort: nextSortOption
                      },
                      location.search
                    );
                    history.push({
                      pathname: location.pathame,
                      search
                    });
                  }}
                />
                {preprints.total_rows === 0 && !fetchResultsProgress.isActive ? (
                  <div>
                    No preprints about this topic have been added to Rapid PREreview.{' '}
                    {!!location.search && (
                      <XLink to={location.pathname} href={location.pathname}>
                        Clear search terms.
                      </XLink>
                    )}
                  </div>
                ) : preprints.bookmark ===
                  (location.state && location.state.bookmark) ? (
                  <div>No more preprints.</div>
                ) : (
                  <ul className="dashboard__preprint-list">
                    {filteredPreprints() ? filteredPreprints().map(row => (
                      <li key={row.id} className="dashboard__preprint-list__item">
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
                    )) : null}
                  </ul>
                )}
                <br/>
                <div className="home__pagination">
                  {!!(location.state && location.state.bookmark) && (
                    <Button
                      onClick={() => {
                        history.push({
                          pathname: location.pathname,
                          search: createPreprintQs({ text: params.get('q') }, location.search)
                        });
                      }}
                    >
                      <MdFirstPage /> First page
                    </Button>
                  )}
                  {/* Cloudant returns the same bookmark when it hits the end of the list */}
                  {!!(
                    preprints.rows.length < preprints.total_rows &&
                    preprints.bookmark !== (location.state && location.state.bookmark)
                  ) && (
                      <Button
                        className="home__next-page-button"
                        onClick={() => {
                          history.push({
                            pathname: location.pathname,
                            search: createPreprintQs({ text: params.get('q') }, location.search),
                            state: { bookmark: preprints.bookmark }
                          });
                        }}
                      >
                        Next Page <MdChevronRight />
                      </Button>
                    )}
                </div>

              </div>

              <div className="dashboard__flex_item">
                <div>
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
                <div className="dashboard__activity">
                  <div  className="dashboard__activity_item">
                    <h2 className="dashboard__h2">Recent Activity</h2>
                    {sortedActions.map( action =>
                      <RecentActivity
                        key={action['@id']}
                        action={action}
                      />
                    )}
                  </div>
                  <div  className="dashboard__activity_item">
                    <h2 className="dashboard__h2">Active Reviewers</h2>
                    <ol className="dashboard__activity_item_list">
                      {justUsers.map(user =>
                        <li>
                          <ActiveUser
                            key={user['@id']}
                            user={user}
                          />
                        </li>
                      )}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
