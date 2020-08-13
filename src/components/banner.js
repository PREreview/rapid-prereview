import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import XLink from './xlink';

export default function Banner() {
  return (
  <React.Fragment>
    <div className='announcement'>
      <p>Get involved with rapidly reviewing COVID-19 preprints and then view our <a className='announcement-link' href={`${process.env.API_URL}/dashboard`}>COVID-19 Dashboard</a> of review activities and recommendations.</p>
      <p>Read about the <a className='announcement-link' href="https://oaspa.org/covid-19-publishers-open-letter-of-intent-rapid-review/?highlight=covid-19" target="_blank">OASPA’s initiative</a> to ensure rapid review of key COVID-19 work.</p>
    </div>
  </React.Fragment>
  )
}
