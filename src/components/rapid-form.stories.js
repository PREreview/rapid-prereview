import React from 'react';
import faker from 'faker';
import sample from 'lodash/sample';
import RapidForm from './rapid-form';
import { QUESTIONS } from '../constants';

export default { title: 'RapidForm' };

export function empty() {
  return (
    <RapidForm
      onSubmit={nextAction => {
        console.log(nextAction);
      }}
    />
  );
}

export function populated() {
  const action = {
    '@type': 'RapidPREreviewAction',
    object: {
      '@type': 'ScholarlyPreprint',
      doi: '10.1101/674655',
      name:
        'Temporal and spatial limitations in global surveillance for bat filoviruses and henipaviruses',
      datePosted: '2019-09-30T00:00:00.000Z',
      preprintServer: { '@type': 'PreprintServer', name: 'bioRxiv' }
    },
    resultReview: {
      '@type': 'RapidPREreview',
      about: [
        {
          '@type': 'OutbreakScienceEntity',
          name: 'filovirus'
        }
      ],
      reviewAnswer: QUESTIONS.map(question => {
        return {
          '@type': question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
          parentItem: `question:${question.identifier}`,
          text:
            question.type === 'YesNoQuestion'
              ? sample(['yes', 'no', 'n.a.', 'unsure'])
              : faker.lorem.paragraph()
        };
      })
    }
  };

  return (
    <RapidForm
      rapidPREreviewAction={action}
      onSubmit={nextAction => {
        console.log(nextAction);
      }}
    />
  );
}
