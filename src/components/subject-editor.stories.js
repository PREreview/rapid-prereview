import React, { useState } from 'react';
import pick from 'lodash/pick';
import { DISEASES } from '../constants';
import SubjectEditor from './subject-editor';

export default { title: 'SubjectEditor' };

export function WithDiseases() {
  const [subjects, setSubjects] = useState(
    DISEASES.slice(0, 3).map(disease =>
      Object.assign(
        {
          '@type': 'OutbreakScienceEntity'
        },
        pick(disease, ['name', 'alternateName'])
      )
    )
  );

  return (
    <SubjectEditor
      subjects={subjects}
      onAdd={subject => {
        setSubjects(
          subjects.concat(subject).sort((a, b) => {
            return (a.alternateName || a.name).localeCompare(
              b.alternateName || b.name
            );
          })
        );
      }}
      onDelete={subject => {
        setSubjects(
          subjects.filter(_subject => _subject.name !== subject.name)
        );
      }}
    />
  );
}
