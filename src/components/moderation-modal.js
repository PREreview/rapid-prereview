import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Modal from './modal';
import Controls from './controls';
import Button from './button';

export default function ModerationModal({
  title,
  moderationProgress,
  onSubmit,
  onCancel
}) {
  const ref = useRef();

  return (
    <Modal title={title}>
      <div className="moderation-modal">
        <label htmlFor="moderation-reason">Reason</label>

        <textarea
          ref={ref}
          id="moderation-reason"
          name="moderationReason"
          rows="4"
        />

        <Controls error={moderationProgress.error}>
          <Button onClick={onCancel} disabled={moderationProgress.isActive}>
            Cancel
          </Button>
          <Button
            disabled={moderationProgress.isActive}
            isWaiting={moderationProgress.isActive}
            onClick={() => {
              const { value } = ref.current;
              onSubmit(value || undefined);
            }}
          >
            Submit
          </Button>
        </Controls>
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
