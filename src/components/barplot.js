import React from 'react';

export default function Barplot() {
  return (
    <div className="barplot">
      <ul className="barplot__question-list">
        <li className="barplot__question-list__item">
          <table className="barplot__question-table" tabIndex={0}>
            <caption className="barplot__question">Result for Q1:</caption>
            <thead className="barplot__table-header">
              <tr className="barplot__segment-titles">
                <th className="barplot__segment-title" style={{ width: '10%' }}>
                  yes
                </th>
                <th className="barplot__segment-title" style={{ width: '20%' }}>
                  no
                </th>
                <th className="barplot__segment-title" style={{ width: '30%' }}>
                  unsure
                </th>
                <th className="barplot__segment-title" style={{ width: '40%' }}>
                  n.a.
                </th>
              </tr>
            </thead>
            <tbody className="barplot__responses">
              <tr className="barplot__bar-segments">
                <td
                  className="barplot__bar-segment barplot__bar-segment--yes"
                  style={{ width: '10%' }}
                >
                  10%
                </td>
                <td
                  className="barplot__bar-segment barplot__bar-segment--no"
                  style={{ width: '20%' }}
                >
                  20%
                </td>
                <td
                  className="barplot__bar-segment barplot__bar-segment--unsure"
                  style={{ width: '30%' }}
                >
                  30%
                </td>
                <td
                  className="barplot__bar-segment barplot__bar-segment--na"
                  style={{ width: '40%' }}
                >
                  40%
                </td>
              </tr>
            </tbody>
          </table>
        </li>

        <li className="barplot__question-list__item">
          <table className="barplot__question-table" tabIndex={0}>
            <caption className="barplot__question">Result for Q2:</caption>
            <thead className="barplot__table-header">
              <tr className="barplot__segment-titles">
                <th className="barplot__segment-title" style={{ width: '10%' }}>
                  yes
                </th>
                <th className="barplot__segment-title" style={{ width: '20%' }}>
                  no
                </th>
                <th className="barplot__segment-title" style={{ width: '30%' }}>
                  unsure
                </th>
                <th className="barplot__segment-title" style={{ width: '40%' }}>
                  n.a.
                </th>
              </tr>
            </thead>
            <tbody className="barplot__responses">
              <tr className="barplot__bar-segments">
                <td
                  className="barplot__bar-segment barplot__bar-segment--yes"
                  style={{ width: '10%' }}
                >
                  10%
                </td>
                <td
                  className="barplot__bar-segment barplot__bar-segment--no"
                  style={{ width: '20%' }}
                >
                  20%
                </td>
                <td
                  className="barplot__bar-segment barplot__bar-segment--unsure"
                  style={{ width: '30%' }}
                >
                  30%
                </td>
                <td
                  className="barplot__bar-segment barplot__bar-segment--na"
                  style={{ width: '40%' }}
                >
                  40%
                </td>
              </tr>
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  );
}
