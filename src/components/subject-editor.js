import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import { MdClose } from 'react-icons/md';
import Diseases from './diseases';
import TagPill from './tag-pill';
import IconButton from './icon-button';

export default function SubjectEditor({ subjects = [], onAdd, onDelete }) {
  return (
    <div className="subject-editor">
      {!!subjects.length && (
        <ul className="subject-editor__list">
          {subjects.map(subject => (
            <li key={subject.name} className="subject-editor__item">
              <TagPill>
                {subject.alternateName ? (
                  <abbr title={subject.name}>{subject.alternateName}</abbr>
                ) : (
                  <span>{subject.name}</span>
                )}
                <IconButton>
                  <MdClose
                    onClick={() => {
                      onDelete(subject);
                    }}
                  />
                </IconButton>
              </TagPill>
            </li>
          ))}
        </ul>
      )}

      <Diseases
        key={subjects.length /* Used to reset the value of the autocomplete */}
        blacklist={subjects}
        onSubmit={subject => {
          onAdd(
            Object.assign(
              {
                '@type': 'OutbreakScienceEntity'
              },
              pick(subject, ['name', 'alternateName'])
            )
          );
        }}
      />
    </div>
  );
}

SubjectEditor.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      alternateName: PropTypes.string
    })
  )
};
