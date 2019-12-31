import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdInfoOutline, MdWarning, MdCheck } from 'react-icons/md';
import { unprefix } from '../utils/jsonld';
import { usePostAction } from '../hooks/api-hooks';
import ToggleSwitch from './toggle-switch';
import TextInput from './text-input';
import Controls from './controls';
import Button from './button';
import IconButton from './icon-button';
import Modal from './modal';

export default function SettingsNotifications({ user }) {
  const contactPoint = user.contactPoint || {};
  const [email, setEmail] = useState(unprefix(contactPoint.email || ''));
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [postEmail, postEmailProgress] = usePostAction();
  const [postActive, postActiveProgress] = usePostAction();
  const [modalType, setModalType] = useState(null);

  return (
    <section className="settings-notifications settings__section">
      <h3 className="settings__title">Notifications</h3>

      <p className="settings-notifications__notice">
        <MdInfoOutline className="settings-notifications__notice-icon" />

        <span>
          Enabling notifications ensures that you receive an email every time a
          review is added to a preprint for which you requested reviews.
        </span>
      </p>

      <div className="settings-notifications__toggle">
        <span>Enable notifications</span>
        <ToggleSwitch
          id="notification-switch"
          disabled={postEmailProgress.isActive || postActiveProgress.isActive}
          checked={contactPoint.active || false}
          onChange={e => {
            console.log('TODO');
          }}
        />
      </div>

      <div className="settings-notifications__email">
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={e => {
            const isValid = !e.target.validity.typeMismatch;
            setEmail(e.target.value);
            setIsEmailValid(isValid);
          }}
        />

        <IconButton
          onClick={() => {
            setModalType(
              contactPoint.dateVerified
                ? 'checked'
                : contactPoint.email
                ? 'verifying'
                : 'empty'
            );
          }}
        >
          {contactPoint.dateVerified ? <MdCheck /> : <MdWarning />}
        </IconButton>
      </div>

      <Controls error={postEmailProgress.error}>
        <Button
          disabled={
            !isEmailValid ||
            !email ||
            postEmailProgress.isActive ||
            postActiveProgress.isActive
          }
          isWaiting={postEmailProgress.isActive}
        >
          {contactPoint.email ? 'Update' : 'Submit'}
        </Button>
      </Controls>

      {!!modalType && (
        <Modal
          title="Info"
          showCloseButton={true}
          onClose={() => {
            setModalType(null);
          }}
        >
          <p>
            {modalType === 'checked'
              ? 'The email address was successfully verified.'
              : modalType === 'verify'
              ? 'An email with a verification link has been sent and we are waiting for you to click on it.'
              : 'An email must be set to be able to receive notifications'}
          </p>

          <Controls>
            <Button
              onClick={() => {
                setModalType(null);
              }}
            >
              Close
            </Button>
          </Controls>
        </Modal>
      )}
    </section>
  );
}

SettingsNotifications.propTypes = {
  user: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.oneOf(['Person']).isRequired,
    contactPoint: PropTypes.shape({
      '@type': PropTypes.oneOf(['ContactPoint']).isRequired,
      email: PropTypes.string,
      dateVerified: PropTypes.string,
      active: PropTypes.bool
    })
  }).isRequired
};
