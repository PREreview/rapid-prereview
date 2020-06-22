import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import XLink from './xlink';
import { useIsMobile } from '../hooks/ui-hooks';


export default function Banner() {
  
  const isMobile = useIsMobile();

  const display = isMobile ? { display: "flex" } : { display: "inline-flexbox "}

  return (
    <div style={display} className='announcement'>
      <p>Click <a href={`${process.env.API_URL}/?q=COVID-19`}>here</a> to find preprints on COVID-19 with reviews or requests for reviews.</p> 
      <p>Click <a href="https://oaspa.org/covid-19-publishers-open-letter-of-intent-rapid-review/?highlight=covid-19" target="_blank">here</a> to read OASPA's open letter of intent to ensure rapid review of key work related to COVID-19.</p>
    </div>
  )
}
