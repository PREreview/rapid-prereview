import React from 'react';
import PropTypes from 'prop-types';

export default function Barplot({ stats }) {
  return (
    <div className="barplot">
      <ul>
        <li>
          <table>
            <caption>Result for Q1:</caption>
            <thead>
              <tr>
                <th>yes</th>
                <th>no</th>
                <th>unsure</th>
                <th>n.a.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>20%</td>
                <td>30%</td>
                <td>40%</td>
              </tr>
            </tbody>
          </table>
        </li>

        <li>
          <table>
            <caption>Result for Q2:</caption>
            <thead>
              <tr>
                <th>yes</th>
                <th>no</th>
                <th>unsure</th>
                <th>n.a.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>20%</td>
                <td>30%</td>
                <td>40%</td>
              </tr>
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  );
}

Barplot.propTypes = {
  stats: PropTypes.array.isRequired
};
