import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './modal';
import Controls from './controls';
import Button from './button';
import XLink from './xlink';

export default function ModerationModal({
  title,
  moderationProgress,
  onSubmit,
  onCancel
}) {
  const [frame, setFrame] = useState('submit');
  const [moderationReason, setModerationReason] = useState('');

  const ref = useRef();

  return (
    <Modal title={title}>
      <div className="moderation-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Reviews need to respect the{' '}
              <XLink to="/code-of-conduct" href="/code-of-conduct">
                code of conduct
              </XLink>
              .
            </p>

            <label htmlFor="moderation-reason">Report reason</label>

            <textarea
              ref={ref}
              id="moderation-reason"
              name="moderationReason"
              rows="4"
              value={moderationReason}
              onChange={e => {
                setModerationReason(e.target.value);
              }}
            />

            <Controls error={moderationProgress.error}>
              <Button onClick={onCancel} disabled={moderationProgress.isActive}>
                Cancel
              </Button>
              <Button
                disabled={
                  moderationProgress.isActive ||
                  !moderationReason ||
                  !moderationReason.trim()
                }
                isWaiting={moderationProgress.isActive}
                onClick={() => {
                  const sanitized = moderationReason
                    ? moderationReason.trim()
                    : moderationReason;

                  onSubmit(
                    sanitized || undefined /* convert '' to undefined*/,
                    () => {
                      setFrame('success');
                    }
                  );
                }}
              >
                Submit
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              Your report was successfully submitted. Thank you for your
              contribution.
            </p>

            <Controls>
              <Button onClick={onCancel}>Close</Button>
            </Controls>
          </Fragment>
        )}
      </div>
    </Modal>
  );
}

ModerationModal.propTypes = {
  title: PropTypes.string.isRequired,
  moderationProgress: PropTypes.shape({
    isActive: PropTypes.bool,
    error: PropTypes.instanceOf(Error)
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
