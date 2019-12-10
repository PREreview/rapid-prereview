import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { MdErrorOutline } from 'react-icons/md';
import Modal from './modal';
import XLink from './xlink';

export default function LoginRequiredModal({ onClose, next }) {
  const url = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  return (
    <Modal
      className="login-required-modal"
      showCloseButton={true}
      onClose={onClose}
      aria-label="log in required"
      title={
        <Fragment>
          <MdErrorOutline className="login-required-modal__title-icon" />
          Log in required
        </Fragment>
      }
    >
      <p>You need to be logged in to perform this action</p>

      <p>
        <XLink to={url} href={url}>
          Log in with your ORCID
        </XLink>
      </p>
    </Modal>
  );
}

LoginRequiredModal.propTypes = {
  next: PropTypes.string,
  onClose: PropTypes.func.isRequired
};
