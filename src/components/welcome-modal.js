import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Modal from './modal';
import Button from './button';
import PrereviewLogo from '../svgs/prereview-logo.svg';
import OutbreakSciLogo from '../svgs/outbreak-science-logo.svg';

export default function WelcomeModal(props) {
  return (
    <Modal
      showCloseButton={false}
      className="welcome-modal"
      aria-label="welcome"
      {...props}
    >
      <div className="welcome-modal__content">
        <header className="welcome-modal__banner">
          <div className="welcome-modal__banner__background"></div>
        </header>
        <div className="welcome-modal__body">
          <h2 className="welcome-modal__title">
            Welcome to Rapid PREreview for Outbreak Science
          </h2>

          <p>
            This platform was designed to facilitate rapid, open review or
            preprint related to outbreaks.
          </p>
          <div>
            Here you can:
            <ol>
              <li>Find rapid reviews of existing preprints.</li>
              <li>
                Request reviews of preprints (your own, or preprints you are
                interested in).
              </li>
              <li>Review preprints.</li>
            </ol>
          </div>

          <div className="welcome-modal__controls">
            <Link className="welcome-modal__get-app" to="/app">
              Get App
            </Link>
            <Button pill={true} primary={true} onClick={props.onClose}>
              Get Started
            </Button>
          </div>
        </div>
        <div className="welcome-modal__logo-row">
          <PrereviewLogo /> <OutbreakSciLogo />
        </div>
      </div>
    </Modal>
  );
}

WelcomeModal.propTypes = {
  onClose: PropTypes.func
};
