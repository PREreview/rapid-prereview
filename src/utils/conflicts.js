import flatten from 'lodash/flatten';
import pick from 'lodash/pick';
import uniq from 'lodash/uniq';
import { INDEXED_PREPRINT_PROPS } from '../constants';
import { getId, cleanup, arrayify } from '../utils/jsonld';
import { getUniqueModerationActions } from '../utils/actions';

export function mergePreprintConflicts(docs) {
  return docs.reduce((merged, doc) => {
    // score: latest wins
    if (
      new Date(merged.dateScoreLastUpdated).getTime() <
      new Date(doc.dateScoreLastUpdated).getTime()
    ) {
      merged.dateScoreLastUpdated = doc.dateScoreLastUpdated;
      merged.score = doc.score;
    }

    // indexed preprint props: higher number of `sdRetrievedFields` wins and
    // if equal, latest `sdDateRetrieved` wins
    if (
      merged.sdRetrievedFields.length < doc.sdRetrievedFields.length ||
      (merged.sdRetrievedFields.length === doc.sdRetrievedFields.length &&
        new Date(merged.sdDateRetrieved).getTime() <
          new Date(doc.sdDateRetrieved).getTime())
    ) {
      INDEXED_PREPRINT_PROPS.forEach(p => {
        merged[p] = doc[p];
      });
    }

    // `potentialAction`: we merge all distincts taking care to always merge
    // the `moderationAction`
    if (doc.potentialAction) {
      merged.potentialAction = arrayify(merged.potentialAction)
        .map(potentialAction => {
          const _potentialAction = arrayify(doc.potentialAction).find(
            _potentialAction =>
              getId(_potentialAction) === getId(potentialAction)
          );

          if (_potentialAction) {
            return cleanup(
              Object.assign({}, potentialAction, {
                moderationAction: getUniqueModerationActions(
                  arrayify(potentialAction.moderationAction).concat(
                    arrayify(_potentialAction.moderationAction)
                  )
                )
              }),
              { removeEmptyArray: true }
            );
          } else {
            return potentialAction;
          }
        })
        .concat(
          arrayify(doc.potentialAction).filter(_potentialAction => {
            return !arrayify(merged.potentialAction).some(
              potentialAction =>
                getId(potentialAction) === getId(_potentialAction)
            );
          })
        );
    }

    return merged;
  }, Object.assign({}, docs[0]));
}

export function mergeReviewActionConflicts(docs) {
  // Note that the reviewAction are all identical aside from the
  // `moderationAction` list so we take the first one and just focus on merging
  // `moderationAction`
  return cleanup(
    Object.assign({}, docs[0], {
      moderationAction: getUniqueModerationActions(
        flatten(docs.map(doc => arrayify(doc.moderationAction)))
      )
    }),
    { removeEmptyArray: true }
  );
}

export function mergeUserConflicts(docs) {
  const specialProps = ['token', 'apiKey', 'hasRole', '_rev']; // those need special logic to be merged

  return docs.reduce((merged, doc) => {
    // all props but `specialProps` (latest wins)
    if (
      new Date(merged.dateModified).getTime() <
      new Date(doc.dateModified).getTime()
    ) {
      merged = Object.assign(
        pick(merged, specialProps),
        pick(
          doc,
          Object.keys(doc).filter(p => !specialProps.includes(p))
        )
      );
    }

    // `token`: latest wins
    if (
      (!merged.token && doc.token) ||
      (merged.token &&
        doc.token &&
        new Date(merged.token.dateCreated).getTime() <
          new Date(doc.token.dateCreated).getTime())
    ) {
      merged.token = doc.token;
    }

    // `apiKey`: latest wins
    if (
      (!merged.apiKey && doc.apiKey) ||
      (merged.apiKey &&
        doc.apiKey &&
        new Date(merged.apiKey.dateCreated).getTime() <
          new Date(doc.apiKey.dateCreated).getTime())
    ) {
      merged.apiKey = doc.apiKey;
    }

    // `hasRole`
    // We can NOT lose role @ids => we ALWAYS merge
    // Later we can sameAs in case the user reconciles
    merged.hasRole = uniq(
      arrayify(merged.hasRole).concat(arrayify(doc.hasRole))
    );

    return merged;
  }, Object.assign({}, docs[0]));
}
