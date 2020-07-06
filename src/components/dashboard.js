import React from 'react';
import { getTags, getReviewerStats } from '../utils/stats';
import { createActivityQs } from '../utils/search';
import { useActionsSearchResults, usePreprintActions } from '../hooks/api-hooks';

export default function Dashboard() {  

  // fetch all preprints with  covid-19 in the title
  // endpoint would look something like https://outbreaksci.prereview.org/api/preprint?q=name%3ACOVID-19&include_docs=true

  // TODO: figure out if it's enough to search just the titles/names
  // TODO: how to incorporate subjects, as well
  // TODO: create shortcuts for potentially common searches, e.g. masks, etc 

  // get all actions related to these preprints 
  const [actions, fetchProgress] = usePreprintActions(getId(action.object));

  const safeActions = useMemo(() => {
    return actions.filter(
      action =>
        !checkIfIsModerated(action) &&
        (action['@type'] === 'RequestForRapidPREreviewAction' ||
          action['@type'] === 'RapidPREreviewAction')
    );
  }, [actions]);

  // find preprints that are recommended to others and for peer review 
  const { recdToOthers, recdForPeers } = getTags(safeActions)

  // sort actions to populate a "Recent activity" section


  // get active reviewers 

  return (
    <article>
      <h1>hello</h1>
    </article>
  )
}