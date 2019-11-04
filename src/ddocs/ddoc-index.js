/* global index, emit, striptags */

const ddoc = {
  _id: '_design/ddoc-index',
  views: {
    triggeringSeqByDateSynced: {
      map: function(doc) {
        if (
          doc['@type'] === 'ScholarlyPreprint' &&
          doc.dateSynced &&
          doc.triggeringSeq
        ) {
          emit(new Date(doc.dateSynced).getTime(), doc.triggeringSeq);
        }
      },
      reduce: '_count'
    },
    preprintsByIdentifier: {
      map: function(doc) {
        if (doc['@type'] === 'ScholarlyPreprint') {
          if (doc.doi) {
            emit(doc.doi, null);
          }
          if (doc.arXivId) {
            emit(doc.arXivId, null);
          }
        }
      },
      reduce: '_count'
    },
    preprintsByScoreAndDatePosted: {
      map: function(doc) {
        if (doc['@type'] === 'ScholarlyPreprint') {
          emit([doc.score, new Date(doc.datePosted).getTime()], null);
        }
      },
      reduce: '_count'
    }
  },
  indexes: {
    preprints: {
      analyzer: {
        name: 'perfield',
        default: 'english',
        fields: {
          '@id': 'keyword',
          '@type': 'keyword',
          doi: 'keyword',
          arXivId: 'keyword',
          reviewerRoleId: 'keyword',
          requesterRoleId: 'keyword',
          subjectName: 'keyword',
          hasReviews: 'keyword',
          hasRequests: 'keyword',
          hasData: 'keyword',
          hasCode: 'keyword'
        }
      },
      index: function(doc) {
        // @inject(striptags)

        if (doc['@type'] === 'ScholarlyPreprint') {
          ['@id', '@type', 'doi', 'arXivId'].forEach(function(identifier) {
            if (doc[identifier] && typeof doc[identifier] === 'string') {
              index(identifier, doc[identifier]);
            }
          });

          if (doc.name) {
            var name = doc.name['@value']
              ? striptags(doc.name['@value'])
              : doc.name;
            if (typeof name === 'string') {
              index('name', name);
            }
          }

          if (doc.preprintServer && doc.preprintServer.name) {
            var preprintServerName = doc.preprintServer.name['@value']
              ? striptags(doc.preprintServer.name['@value'])
              : doc.preprintServer.name;
            if (typeof preprintServerName === 'string') {
              index('preprintServerName', preprintServerName);
            }
          }

          index('score', doc.score || 0, { facet: true });

          var datePosted = doc.datePosted
            ? new Date(doc.datePosted).getTime()
            : new Date('0000').getTime();
          index('datePosted', datePosted, { facet: true });

          // date of first activity (`dateFirstActivity`)
          var firstAction = (doc.potentialAction || [])
            .filter(function(action) {
              return action && action.startTime;
            })
            .sort(function(a, b) {
              return (
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
              );
            })[0];
          var dateFirstActivity = firstAction
            ? new Date(firstAction.startTime).getTime()
            : new Date('0000').getTime();
          index('dateFirstActivity', dateFirstActivity);

          if (doc.potentialAction) {
            // reviewer and requester
            doc.potentialAction.forEach(function(action) {
              if (action.agent) {
                var agentId = action.agent['@id'] || action.agent;
                if (typeof agentId === 'string') {
                  if (action['@type'] === 'RapidPREreviewAction') {
                    index('reviewerRoleId', agentId);
                  } else if (
                    action['@type'] === 'RequestForRapidPREreviewAction'
                  ) {
                    index('requesterRoleId', agentId);
                  }
                }
              }
            });

            var hasReviews = doc.potentialAction.some(function(action) {
              return action['@type'] === 'RapidPREreviewAction';
            });
            index('hasReviews', hasReviews ? 'true' : 'false', { facet: true });

            var hasRequests = doc.potentialAction.some(function(action) {
              return action['@type'] === 'RequestForRapidPREreviewAction';
            });
            index('hasRequests', hasRequests ? 'true' : 'false', {
              facet: true
            });

            // facets based on the reviews and requests
            // we index if the majority of reviews have the same answer
            var reviewActions = doc.potentialAction.filter(function(action) {
              return action['@type'] === 'RapidPREreviewAction';
            });

            var threshold = Math.ceil(reviewActions.length / 2);

            // hasData
            var reviewsWithData = reviewActions.filter(function(action) {
              if (action.resultReview && action.resultReview.reviewAnswer) {
                var answers = action.resultReview.reviewAnswer;

                for (var i = 0; i < answers.length; i++) {
                  var answer = answers[i];
                  if (answer.parentItem) {
                    var questionId =
                      answer.parentItem['@id'] || answer.parentItem;
                    if (questionId === 'question:ynAvailableData') {
                      return (answer.text || '').toLowerCase().trim() === 'yes';
                    }
                  }
                }
              }
              return false;
            });

            var hasData = reviewsWithData.length >= threshold;
            index('hasData', hasData ? 'true' : 'false', {
              facet: true
            });

            // hasCode
            var reviewsWithCode = reviewActions.filter(function(action) {
              if (action.resultReview && action.resultReview.reviewAnswer) {
                var answers = action.resultReview.reviewAnswer;

                for (var i = 0; i < answers.length; i++) {
                  var answer = answers[i];
                  if (answer.parentItem) {
                    var questionId =
                      answer.parentItem['@id'] || answer.parentItem;
                    if (questionId === 'question:ynAvailableCode') {
                      return (answer.text || '').toLowerCase().trim() === 'yes';
                    }
                  }
                }
              }
              return false;
            });

            var hasCode = reviewsWithCode.length >= threshold;
            index('hasCode', hasCode ? 'true' : 'false', {
              facet: true
            });

            // subjectName
            var subjectCountMap = {};
            reviewActions.forEach(function(action) {
              if (action.resultReview && action.resultReview.about) {
                action.resultReview.about.forEach(function(subject) {
                  if (typeof subject.name === 'string') {
                    if (subject.name in subjectCountMap) {
                      subjectCountMap[subject.name] += 1;
                    } else {
                      subjectCountMap[subject.name] = 1;
                    }
                  }
                });
              }
            });

            var subjectNames = Object.keys(subjectCountMap).filter(function(
              subjectName
            ) {
              var count = subjectCountMap[subjectName];
              return count >= threshold;
            });
            if (!subjectNames.length) {
              subjectNames.push('tmp:null');
            }
            subjectNames.forEach(function(subjectName) {
              index('subjectName', subjectName, {
                facet: true
              });
            });
          }
        }
      }
    }
  }
};

export default ddoc;
