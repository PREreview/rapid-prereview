import React from 'react';
import faker from 'faker';
import TextAnswers from './text-answers';
import { QUESTIONS } from '../constants';

export default { title: 'TextAnswers' };

export function Random() {
  const roleIds = ['role:role1', 'role:role2'];

  const answers = QUESTIONS.filter(({ type }) => {
    return type === 'Question';
  }).map(({ question, identifier }) => {
    return {
      questionId: `question:${identifier}`,
      question,
      answers: roleIds.map(roleId => {
        return { roleId, text: faker.lorem.paragraph() };
      })
    };
  });

  return <TextAnswers answers={answers} />;
}
