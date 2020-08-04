import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import XLink from './xlink';

export default function Banner() {
  return (
  <React.Fragment>
    <div className='announcement'>
      <p>Click <a className='announcement-link' href={`${process.env.API_URL}/dashboard`}>here</a> to find preprints on COVID-19 with reviews or requests for reviews.</p>
      <p>Click <a className='announcement-link' href="https://oaspa.org/covid-19-publishers-open-letter-of-intent-rapid-review/?highlight=covid-19" target="_blank">here</a> to read OASPA's open letter of intent to ensure rapid review of key work related to COVID-19.</p>
    </div>
  </React.Fragment>
  )
}
