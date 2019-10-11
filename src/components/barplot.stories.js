import React from 'react';
import sampleSize from 'lodash/sampleSize';
import uuid from 'uuid';
import Barplot from './barplot';
import { QUESTIONS } from '../constants';

export default { title: 'Barplot' };

export function TableList() {
  const nReviews = 10;
  const roleIds = Array.from({ length: nReviews }, () => `role:${uuid.v4()}`);

  const stats = QUESTIONS.filter(q => q.type === 'YesNoQuestion').map(
    ({ question, identifier }) => {
      let _roleIds = roleIds.slice();

      const nYes = Math.ceil(_roleIds.length * Math.random());
      const yes = sampleSize(_roleIds, nYes);
      _roleIds = roleIds.filter(roleId => !yes.includes(roleId));

      const nNo = Math.ceil(_roleIds.length * Math.random());
      const no = sampleSize(_roleIds, nNo);
      _roleIds = roleIds.filter(roleId => !yes.concat(no).includes(roleId));

      const nNa = Math.ceil(_roleIds.length * Math.random());
      const na = sampleSize(_roleIds, nNa);
      _roleIds = roleIds.filter(roleId => !yes.concat(no, na).includes(roleId));

      const nUnsure = nReviews - nYes - nNo - nNa;
      const unsure = sampleSize(_roleIds, nUnsure);
      _roleIds = roleIds.filter(
        roleId => !yes.concat(no, na, unsure).includes(roleId)
      );

      return {
        questionId: `question:${identifier}`,
        nReviews,
        question,
        yes,
        no,
        na,
        unsure
      };
    }
  );

  return <Barplot stats={stats} />;
}
