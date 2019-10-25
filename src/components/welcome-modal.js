import React from 'react';
import PropTypes from 'prop-types';
import Modal from './modal';
import Button from './button';

export default function WelcomeModal(props) {
  return (
    <Modal showCloseButton={false} className="welcome-modal" {...props}>
      <div className="welcome-modal__content">
        <header className="welcome-modal__banner">
          <div className="welcome-modal__banner__background"></div>
        </header>
        <div className="welcome-modal__body">
          <h2 className="welcome-modal__title">
            Welcome to Rapid PREreview for Outbreak Science
          </h2>

          <p>
            Rapid PREreview allows to request and provide feedback (in the form
            of structured review rapid to complete) on <em>existing</em>{' '}
            preprints relevant to the outbreak science community.
          </p>

          <div className="welcome-modal__controls">
            <Button pill={true} primary={true} onClick={props.onClose}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

WelcomeModal.propTypes = {
  onClose: PropTypes.func
};
