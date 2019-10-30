import React from 'react';
import HeaderBar from './header-bar';
import AnimatedLogo from '../svgs/rapid-prereview-logo-animation.svg';
import Button from './button';

export default function Login() {
  return (
    <div className="login">
      <HeaderBar />
      <div className="login__content">
        <div className="login__logo-container">
          <AnimatedLogo />
        </div>
        <h2 className="login__header">
          To log in to PREreview you will need an ORCID ID.
        </h2>
        <p className="login__text">
          Click below to sign in with your ORCID account, or create one if you
          don't have one.
        </p>
        <Button
          element="a"
          href="/auth/orcid"
          primary={true}
          className="login__login-button"
        >
          Sign in with ORCID
        </Button>
      </div>
    </div>
  );
}
