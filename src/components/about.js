import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ORG } from '../constants';
import Org from './org';
import WellcomeLogo from '../svgs/wellcome-logo-black.svg';

export default function About() {
  return (
    <article>
      <Helmet>
        <title>{ORG} • About </title>
      </Helmet>
      <h1 id="about">About</h1>
      <section>
        <h2 id="project"> Project</h2>
        <p>
          <strong>
            <Org />
          </strong>
          {` `}is a web application for open, rapid reviews of outbreak-related
          preprints.
        </p>
        <p>On this platform you can:</p>
        <ul>
          <li>Find rapid reviews of existing preprints;</li>
          <li>
            Request reviews of preprints (your own, or preprints you are
            interested in);
          </li>
          <li>Review preprints.</li>
        </ul>
        <p>
          This open project is funded by the Wellcome Trust as a collaboration
          between Outbreak Science and PREreview.
        </p>
        <p>
          <a href="https://outbreakscience.org/">Outbreak Science</a> is a
          non-profit organization aiming to advance the science of outbreak
          response. Outbreak Science supports early and open dissemination of
          data, code, and research.
        </p>
        <p>
          <a href="https://v2.prereview.org/">PREreview</a> is an open project
          fiscally sponsored by the non-profit organization Code for Science &
          Society. PREreview’s mission is to increase diversity in the scholarly
          peer review process by empowering all researchers to engage with
          preprint reviews.
        </p>
      </section>
      <section>
        <h2 id="Team">Team</h2>
        <h3>Leadership</h3>
        <ul>
          <li>Michael Johansson, Founder, Director, Outbreak Science</li>
          <li>Daniela Saderi, Co-Founder, Director, PREreview</li>
          <li>Samantha Hindle, Co-Founder, Leadership Team PREreview</li>
          <li>Monica Granados, Leadership Team PREreview</li>
        </ul>
        <h3>Development team</h3>
        <ul>
          <li>Sebastien Ballesteros</li>
          <li>Erik Wysocan</li>
        </ul>
      </section>
      <section>
        <h2 id="contact">Contact</h2>
        <ul>
          <li>
            Email:{' '}
            <a href="mailto:outbreaksci@prereview.org">
              outbreaksci@prereview.org
            </a>
          </li>
          <li>
            Twitter: <a href="https://twitter.com/outbreaksci">@outbreaksci</a>,{' '}
            <a href="https://twitter.com/PREreview_">@PREreview_</a>,{' '}
            <a href="https://twitter.com/hashtag/OSrPRE">#OSrPRE</a>
          </li>
          <li>
            Github:{' '}
            <a href="https://github.com/PREreview/rapid-prereview">
              https://github.com/PREreview/rapid-prereview
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2 id="funding">Funding</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ margin: '24px', width: '100px' }}>
            <WellcomeLogo
              style={{ objectFit: 'contain', maxWidth: '100%', width: '100%' }}
            />
          </div>
          <a href="https://wellcome.ac.uk/funding/schemes/open-research-fund">
            Wellcome Trust Open Research Fund
          </a>
          2018-2019
        </div>
      </section>
    </article>
  );
}
