import React from 'react';
import noop from 'lodash/noop';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import PropTypes from 'prop-types';

export default function Modal({ onClose = noop, children }) {
  return (
    <DialogOverlay onDismiss={onClose}>
      <DialogContent>{children}</DialogContent>
    </DialogOverlay>
  );
}

Modal.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.any
};
