import React, { useState } from 'react';
import faker from 'faker';
import sample from 'lodash/sample';
import RapidFormFragment from './rapid-form-fragment';
import { QUESTIONS } from '../constants';
import { getAnswerMap } from '../utils/actions';

export default { title: 'RapidFormFragment' };

export function Empty() {
  const [answerMap, setAnswerMap] = useState({});

  return (
    <RapidFormFragment
      answerMap={answerMap}
      onChange={(key, value) => {
        setAnswerMap(prev => {
          return Object.assign({}, prev, { [key]: value });
        });
      }}
    />
  );
}

export function Populated() {
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

  const [answerMap, setAnswerMap] = useState(getAnswerMap(action));

  return (
    <RapidFormFragment
      answerMap={answerMap}
      onChange={(key, value) => {
        setAnswerMap(prev => {
          return Object.assign({}, prev, { [key]: value });
        });
      }}
    />
  );
}
