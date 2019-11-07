import React from 'react';
import PropTypes from 'prop-types';

export default function Barplot({
  nTotalReviews,
  nHighlightedReviews,
  stats,
  children
}) {
  return (
    <div className="barplot">
      <div className="barplot__question-list-header">
        <div className="barplot__question-list-header__left">
          <span>
            Showing {nHighlightedReviews} of {nTotalReviews} Reviews
          </span>
        </div>

        <div className="barplot__question-list-header__right">
          <div className="barplot__key">
            <div className="barplot__key-item">
              <div className="barplot__key-color-chip barplot__key-color-chip--yes" />
              <span className="barplot__key-label">Yes</span>
            </div>
            <div className="barplot__key-item">
              <div className="barplot__key-color-chip barplot__key-color-chip--no" />
              <span className="barplot__key-label">No</span>
            </div>
            <div className="barplot__key-item">
              <div className="barplot__key-color-chip barplot__key-color-chip--unsure" />
              <span className="barplot__key-label">Unsure</span>
            </div>
            <div className="barplot__key-item">
              <div className="barplot__key-color-chip barplot__key-color-chip--na" />
              <span className="barplot__key-label">N/A</span>
            </div>
          </div>
          {!!children && <div className="barplot__share">{children}</div>}
        </div>
      </div>
      <ul className="barplot__question-list">
        {stats.map(
          ({ questionId, nReviews, question, yes, no, na, unsure }) => (
            <li
              className="barplot__question-list__item"
              key={questionId}
              tabIndex={0}
            >
              <table className="barplot__question-table">
                <caption className="barplot__question">{question}</caption>
                <thead className="barplot__table-header">
                  <tr className="barplot__segment-titles">
                    <th
                      className="barplot__segment-title"
                      style={{ width: `${(yes.length / nReviews) * 100}%` }}
                    >
                      {yes.length > 0 ? 'yes' : ''}
                    </th>

                    <th
                      className="barplot__segment-title"
                      style={{ width: `${(no.length / nReviews) * 100}%` }}
                    >
                      {no.length > 0 ? 'no' : ''}
                    </th>

                    <th
                      className="barplot__segment-title"
                      style={{
                        width: `${(unsure.length / nReviews) * 100}%`
                      }}
                    >
                      {unsure.length > 0 ? 'unsure' : ''}
                    </th>

                    <th
                      className="barplot__segment-title"
                      style={{ width: `${(na.length / nReviews) * 100}%` }}
                    >
                      {na.length > 0 ? 'n.a.' : ''}
                    </th>
                  </tr>
                </thead>
                <tbody className="barplot__responses">
                  <tr className="barplot__bar-segments">
                    <td
                      className="barplot__bar-segment barplot__bar-segment--yes"
                      style={{ width: `${(yes.length / nReviews) * 100}%` }}
                    >
                      <span className="barplot__bar-segment__number">
                        {yes.length}
                      </span>
                    </td>
                    <td
                      className="barplot__bar-segment barplot__bar-segment--no"
                      style={{ width: `${(no.length / nReviews) * 100}%` }}
                    >
                      <span className="barplot__bar-segment__number">
                        {no.length}
                      </span>
                    </td>
                    <td
                      className="barplot__bar-segment barplot__bar-segment--unsure"
                      style={{
                        width: `${(unsure.length / nReviews) * 100}%`
                      }}
                    >
                      <span className="barplot__bar-segment__number">
                        {unsure.length}
                      </span>
                    </td>
                    <td
                      className="barplot__bar-segment barplot__bar-segment--na"
                      style={{ width: `${(na.length / nReviews) * 100}%` }}
                    >
                      <span className="barplot__bar-segment__number">
                        {na.length}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

Barplot.propTypes = {
  nTotalReviews: PropTypes.number.isRequired,
  nHighlightedReviews: PropTypes.number.isRequired,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      questionId: PropTypes.string.isRequired,
      nReviews: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      yes: PropTypes.arrayOf(PropTypes.string).isRequired, // roleIds
      no: PropTypes.arrayOf(PropTypes.string).isRequired, // roleIds
      na: PropTypes.arrayOf(PropTypes.string).isRequired, // roleIds
      unsure: PropTypes.arrayOf(PropTypes.string).isRequired // roleIds
    })
  ).isRequired,
  children: PropTypes.element // share menu
};
