import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import HeaderBar from './header-bar';
import AnimatedLogo from '../svgs/rapid-prereview-logo-animation.svg';
import Button from './button';
import Checkbox from './checkbox';
import XLink from './xlink';
import Org from './org';
import { ORG } from '../constants';

// TODO make clear that by logging in user accepts the code of conduct

export default function Login() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="login">
      <Helmet>
        <title>{ORG} • Login</title>
      </Helmet>

      <HeaderBar />
      <div className="login__content">
        <div className="login__logo-container">
          <AnimatedLogo />
        </div>

        <h2 className="login__header">
          To log in to <Org /> you will need an ORCID ID.
        </h2>

        <p className="login__text">
          Click below to sign in with your ORCID account, or create one if you
          don’t have one.
        </p>

        <div className="login__coc">
          <span className="login__checkbox">
            <Checkbox
              label={
                <span>
                  I have read and agree to the <Org />{' '}
                  <XLink href="/code-of-conduct" to="/code-of-conduct">
                    Code of Conduct
                  </XLink>
                  .
                </span>
              }
            />
          </span>
        </div>

        <Button
          element="a"
          href={`${process.env.API_URL}/auth/orcid`}
          primary={true}
          className="login__login-button"
        >
          Sign in with ORCID
        </Button>
      </div>
    </div>
  );
}
