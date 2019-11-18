import React from 'react';
import faker from 'faker';
import sample from 'lodash/sample';
import { BrowserRouter as Router } from 'react-router-dom';
import TextAnswers from './text-answers';
import { QUESTIONS } from '../constants';
import { StoresProvider } from '../contexts/store-context';
import { RoleStore } from '../stores/user-stores';

export default { title: 'TextAnswers' };

const roleStore = new RoleStore();

export function Random() {
  const actions = ['role:roleId1', 'role:roleId2', 'role:roleId3'].map(
    roleId => {
      return {
        '@type': 'RapidPREreviewAction',
        agent: roleId,
        actionStatus: 'CompletedActionStatus',
        object: 'doi:doi',
        resultReview: {
          '@type': 'RapidPREreview',
          about: [
            {
              '@type': 'OutbreakScienceEntity',
              name: sample(['Influenza', 'Dengue', 'Zika'])
            }
          ],
          reviewAnswer: QUESTIONS.map(question => {
            return {
              '@type':
                question.type === 'YesNoQuestion' ? 'YesNoAnswer' : 'Answer',
              parentItem: `question:${question.identifier}`,
              text:
                question.type === 'YesNoQuestion'
                  ? sample(['yes', 'no', 'n.a.', 'unsure'])
                  : faker.lorem.paragraph()
            };
          })
        }
      };
    }
  );

  return (
    <Router>
      <StoresProvider roleStore={roleStore}>
        <TextAnswers actions={actions} />
      </StoresProvider>
    </Router>
  );
}
