// base imports
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import omit from 'lodash/omit';
import { ORG } from '../constants';
import { useHistory, useLocation } from 'react-router-dom';
import Org from './org';

// hooks
import { useActionsSearchResults, usePreprintActions, usePreprintSearchResults } from '../hooks/api-hooks';

// utils
import { checkIfIsModerated } from '../utils/actions';
import { getTags, getUsersRank, isYes } from '../utils/stats';
import { createActivityQs, createPreprintQs, apifyPreprintQs } from '../utils/search';
import { getId, arrayify } from '../utils/jsonld'


// contexts
import { useUser } from '../contexts/user-context';

// modules
import AddButton from './add-button';
import Banner from "./banner.js"
import Checkbox from './checkbox';
import FilterOptions from './filter-options';
import SortOptions from './sort-options';
import HeaderBar from './header-bar';
import PreprintCard from './preprint-card';
import SearchBar from './search-bar';
import XLink from './xlink';
import RecentActivity from './recent-activity'
import ActiveUser from './active-user'

// TODO: figure out if it's enough to search just the titles/names
// TODO: how to incorporate subjects, as well
// TODO: create shortcuts for potentially common searches, e.g. masks, etc
// TODO: put title and a small description at the top
// TODO: limit recent activity to a week or if that doesn't exist, then

export default function Dashboard() {
  const history = useHistory();
  const location = useLocation();
  const [user] = useUser();

  const [loginModalOpenNext, setLoginModalOpenNext] = useState(null);

  const apiQs = apifyPreprintQs(
    location.search,
    location.state && location.state.bookmark
  );

  const [preprints, fetchResultsProgress] = usePreprintSearchResults(apiQs);

  const [hoveredSortOption, setHoveredSortOption] = useState(null);

  const [filter, setFilter] = useState([])

  const [display, setDisplay] = useState(preprints ? preprints : []) // set the preprints to display depending on filter

  const params = new URLSearchParams(location.search);

  useEffect(() => {
    if (location.search === "") {
      history.replace({ search: "q=COVID-19" }) // add an OR query here too
    }
  }, [apiQs]);

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
  allActions.forEach( setOfActions => setOfActions.actions.forEach( action => {
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

  /***** get total count of unmoderated reviews for each preprint ****/
  const totalReviews = {}
  safeActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const preprintId = action.preprint['@id']
      console.log("....", action.preprint['name'])
      if (typeof preprintId === 'string') {
        if (preprintId in totalReviews) {
          totalReviews[preprintId] += 1;
        } else {
          totalReviews[preprintId] = 1;
        }
      }
    }
  })

  /*** recommended to others ****/
  const getReviewsWithRecs = safeActions.length ? safeActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynRecommend') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  }) : null;

  const othersCount = {};

  getReviewsWithRecs ? getReviewsWithRecs.forEach(review => {
    const preprintId = review.preprint['@id']
    if (typeof preprintId === 'string') {
      if (preprintId in othersCount) {
        othersCount[preprintId] += 1;
      } else {
        othersCount[preprintId] = 1;
      }
    }
  }) : null

  const preprintsWithOthers = Object.keys(othersCount)

  preprintsWithOthers.forEach(id => {
    const threshold = Math.ceil(totalReviews[id] / 2)
    console.log("threshold for code  :", threshold, `total reviews for ${id}  :`, totalReviews[id])
    const lower = threshold > totalReviews[id]
    if (id in totalReviews && lower) {
      delete othersCount[id]
    }
  })

  /*** preprint has available data ****/
  const getReviewsWithData = safeActions.length ? safeActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynAvailableData') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  }) : null;

  const dataCount = {};

  getReviewsWithData ? getReviewsWithData.forEach(review => {
    const preprintId = review.preprint['@id']
    if (typeof preprintId === 'string') {
      if (preprintId in dataCount) {
        dataCount[preprintId] += 1;
      } else {
        dataCount[preprintId] = 1;
      }
    }
  }) : null

  const preprintsWithData = Object.keys(dataCount)

  preprintsWithData.forEach(id => {
    const threshold = Math.ceil(totalReviews[id] / 2)
    // console.log("threshold for code  :", threshold, `total reviews for ${id}  :`, totalReviews[id])
    const lower = threshold > totalReviews[id]
    if (id in totalReviews && lower) {
      delete dataCount[id]
    }
  })

  /*** recommended for peer review ****/
  const getReviewsWithPeer = safeActions.length ? safeActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynPeerReview') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  }) : null;

  const peerCount = {};

  getReviewsWithPeer ? getReviewsWithPeer.forEach(review => {
    const preprintId = review.preprint['@id']
    if (typeof preprintId === 'string') {
      if (preprintId in peerCount) {
        peerCount[preprintId] += 1;
      } else {
        peerCount[preprintId] = 1;
      }
    }
  }) : null

  const preprintsWithPeer = Object.keys(peerCount)

  preprintsWithPeer.forEach(id => {
    const threshold = Math.ceil(totalReviews[id] / 2)
    console.log("threshold for code  :", threshold, `total reviews for ${id}  :`, totalReviews[id])
    const lower = threshold > totalReviews[id]
    console.log(`${id}: is this lower or no? ${lower}`)
    if (id in totalReviews && lower) {
      delete peerCount[id]
    }
  })

  /******* has available code ******/
  const getReviewsWithCode = safeActions.length ? safeActions.filter(action => {
    if (action.resultReview && action.resultReview.reviewAnswer) {
      const answers = action.resultReview.reviewAnswer;

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        if (answer.parentItem) {
          const questionId = getId(answer.parentItem);
          if (questionId === 'question:ynAvailableCode') {
            return isYes(answer);
          }
        }
      }
    }
    return false;
  }) : null;

  const codeCount = {};

  getReviewsWithCode ? getReviewsWithCode.forEach(review => {
    const preprintId = review.preprint['@id']
    if (typeof preprintId === 'string') {
      if (preprintId in codeCount) {
        codeCount[preprintId] += 1;
      } else {
        codeCount[preprintId] = 1;
      }
    }
  }) : null

  const preprintsWithCode = Object.keys(codeCount)

  preprintsWithCode.forEach(id => {
    const threshold = Math.ceil(totalReviews[id] / 2)
    console.log("threshold for code  :", threshold, `total reviews for ${id}  :`, totalReviews[id])
    const lower = threshold > totalReviews[id]
    if (id in totalReviews && lower) {
      delete codeCount[id]
    }
  })

  // console.log("reviewers say these preprints have code    :", codeCount)
  // console.log("reviewers say these preprints have data    :", dataCount)
  // console.log("reviewers say they'd rec this preprint to others    :", othersCount)
  // console.log("reviewers say they'd rec this preprint for peer review    :", peerCount)

  // sort actions to populate a "Recent activity" section
  const sortedActions = safeActions ? safeActions.slice().sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) : []

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
                    {/* <label htmlFor="recommended-others">Recommended to others</label>
                    <input type="checkbox" id="recommended-others" name="recommended-others" /> */}
                    <Checkbox
                      inputId="counts-others"
                      name="hasOthersRec"
                      label={
                        <span className="facets__facet-label">
                          Recommended to others{' '}
                        </span>
                      }
                      // disabled={!(counts.hasData || {}).true}
                      checked={params.get('others') === 'true'}
                      onChange={e => {
                        const search = createPreprintQs(
                          {
                            hasOthersRec: e.target.checked || null
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
                  </div>
                  <div className="dashboard__options_item">
                    {/* <label htmlFor="recommended-peers">Recommended for peer review</label>
                    <input type="checkbox" id="recommended-peers" name="recommended-peers" /> */}
                    <Checkbox
                      inputId="counts-peer"
                      name="hasPeerRec"
                      label={
                        <span className="facets__facet-label">
                          Recommended for peer review{' '}
                        </span>
                      }
                      // disabled={!(counts.hasData || {}).true}
                      checked={params.get('peer') === 'true'}
                      onChange={e => {
                        const search = createPreprintQs(
                          {
                            hasPeerRec: e.target.checked || null
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
                  </div>
                  <div className="dashboard__options_item">
                    {/* <label htmlFor="data">Contains reported data</label>
                    <input type="checkbox" id="data" name="data" /> */}
                    <Checkbox
                      inputId="counts-data"
                      name="hasData"
                      label={
                        <span className="facets__facet-label">
                          With reported data{' '}
                        </span>
                      }
                      // disabled={!(counts.hasData || {}).true}
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
                  </div>
                  <div className="dashboard__options_item">
                    {/* <label htmlFor="data">Contains reported code</label>
                    <input type="checkbox" id="code" name="code" /> */}
                    <Checkbox
                      inputId="counts-code"
                      name="hasCode"
                      label={
                        <span className="facets__facet-label">
                          With reported code{' '}
                        </span>
                      }
                      // disabled={!(counts.hasCode || {}).true}
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
                    {preprints.rows.map(row => (
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
                    ))}
                  </ul>
                )}
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
