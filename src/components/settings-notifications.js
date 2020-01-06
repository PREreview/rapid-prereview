import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import { MdInfoOutline, MdWarning, MdCheck } from 'react-icons/md';
import { getId, unprefix } from '../utils/jsonld';
import { usePostAction } from '../hooks/api-hooks';
import ToggleSwitch from './toggle-switch';
import TextInput from './text-input';
import Controls from './controls';
import Button from './button';
import IconButton from './icon-button';
import Modal from './modal';
import { createContactPointId } from '../utils/ids';

export default function SettingsNotifications({ user }) {
  const history = useHistory();
  const location = useLocation();
  const contactPoint = user.contactPoint || {};
  const [email, setEmail] = useState(unprefix(contactPoint.email || ''));
  const [isEmailValid, setIsEmailValid] = useState(true);

  const params = new URLSearchParams(location.search);

  const [postEmail, postEmailProgress] = usePostAction();
  const [postActive, postActiveProgress] = usePostAction();
  const [modalType, setModalType] = useState(
    params.get('verified') === 'true' ? 'checked' : null
  );

  function handleClose() {
    if (params.has('verified')) {
      history.replace({
        pathname: location.pathname
      });
    }
    setModalType(null);
  }

  return (
    <section className="settings-notifications settings__section">
      <h3 className="settings__title">Notifications</h3>

      <p className="settings-notifications__notice">
        <MdInfoOutline className="settings-notifications__notice-icon" />

        <span>
          Enabling notifications ensures that you receive an email every time a
          review is added to a preprint for which you requested reviews. The
          email provided will only be used for notifications and will never be
          shared.
        </span>
      </p>

      <div className="settings-notifications__toggle">
        <span>Enable notifications</span>
        <ToggleSwitch
          id="notification-switch"
          disabled={postEmailProgress.isActive || postActiveProgress.isActive}
          checked={contactPoint.active || false}
          onChange={e => {
            postActive({
              '@type': 'UpdateContactPointAction',
              agent: getId(user),
              actionStatus: 'CompletedActionStatus',
              object: createContactPointId(user),
              payload: {
                contactType: 'notifications',
                active: !contactPoint.active
              }
            });
          }}
        />
      </div>

      <div className="settings-notifications__email">
        <TextInput
          label="Email"
          type="email"
          value={email}
          className="settings-notifications__email-input"
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
          {contactPoint.dateVerified ? (
            <MdCheck className="settings-notifications__email-icon" />
          ) : (
            <MdWarning className="settings-notifications__email-icon" />
          )}
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
          onClick={() => {
            postEmail(
              {
                '@type': 'UpdateContactPointAction',
                agent: getId(user),
                actionStatus: 'CompletedActionStatus',
                object: createContactPointId(user),
                payload: {
                  contactType: 'notifications',
                  active: !!contactPoint.active,
                  email: `mailto:${email}`
                }
              },
              action => {
                setModalType('verifying');
              }
            );
          }}
        >
          {contactPoint.email ? 'Update' : 'Submit'}
        </Button>
      </Controls>

      {!!modalType && (
        <Modal title="Info" showCloseButton={true} onClose={handleClose}>
          <p>
            {modalType === 'checked'
              ? 'The email address was successfully verified.'
              : modalType === 'verifying'
              ? 'An email with a verification link has been sent and we are waiting for you to click on it.'
              : 'An email must be set to be able to receive notifications'}
          </p>

          <Controls>
            <Button onClick={handleClose}>Close</Button>
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
