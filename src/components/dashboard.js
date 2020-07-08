import React, { useEffect, useState, useMemo } from 'react';
import { getTags, getReviewerStats } from '../utils/stats';
import { createActivityQs } from '../utils/search';
import { checkIfIsModerated } from '../utils/actions';
import { useActionsSearchResults, usePreprintActions } from '../hooks/api-hooks';

// TODO: figure out if it's enough to search just the titles/names
// TODO: how to incorporate subjects, as well
// TODO: create shortcuts for potentially common searches, e.g. masks, etc 

export default function Dashboard() {  
  // fetch all preprints with  covid-19 in the title
  // endpoint would look something like https://outbreaksci.prereview.org/api/preprint?q=name%3ACOVID-19&include_docs=true

  const [preprints, setPreprints] = useState([])

  useEffect(() => {
    fetchPreprints();
  }, []);

  const fetchPreprints = async () => {
    const response = await fetch(`http://localhost:3000/api/preprint?q=name%3ACOVID-19&include_docs=true`)
    const data = await response.json();
    console.log("data?", data.rows)
    setPreprints(data.rows)
  }

  let actions = [] 
  
  /*** 
   * collects an array of action objects from each preprint, 
   * where each item of the array has actions from each preprint
   * */ 
  
  preprints.length ? actions = preprints.map(preprint => {
    return {
      preprint: preprint.doc,
      actions: preprint.doc.potentialAction
    }
  })
  : actions = []

  let allActions = []
  
  /**
   * adding the preprint info to each action, 
   * and pushing each individual action to a new array
   * */ 

  actions.forEach(object => object.actions.forEach(action => {
    action["preprint"] = object.preprint
    allActions.push(action)
  }))
  
  // get all actions related to these preprints 
  const safeActions = useMemo(() => {
    return allActions.filter(
      action =>
        !checkIfIsModerated(action) &&
        (action['@type'] === 'RequestForRapidPREreviewAction' ||
          action['@type'] === 'RapidPREreviewAction')
    );
  }, [allActions]);

  // // find preprints that are recommended to others and for peer review 
  const { recdToOthers, recdForPeers } = getTags(safeActions)

  // sort actions to populate a "Recent activity" section
  

  // get active reviewers 

  return (
    <article>
      <h1>hello</h1>
    </article>
  )
}