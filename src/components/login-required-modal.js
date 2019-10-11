import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdErrorOutline } from 'react-icons/md';
import Modal from './modal';

export default function LoginRequiredModal({ onClose }) {
  return (
    <Modal
      className="home-login-modal"
      showCloseButton={true}
      onClose={onClose}
      title={
        <span className="home-login-modal__title">
          <MdErrorOutline className="home-login-modal__title-icon" />
          Log in required
        </span>
      }
    >
      <p>You need to be logged in to perform this action</p>

      <p>
        <Link to="/login">Log in with your ORCID</Link>
      </p>
    </Modal>
  );
}

LoginRequiredModal.propTypes = {
  onClose: PropTypes.func.isRequired
};
