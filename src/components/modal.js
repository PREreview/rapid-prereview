import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import { MdClose } from 'react-icons/md';
import IconButton from './icon-button';

export default function Modal({
  onClose = noop,
  title,
  showCloseButton = false,
  children,
  className,
  ...others
}) {
  return (
    <DialogOverlay onDismiss={onClose}>
      <DialogContent
        aria-label={others['aria-label'] || title}
        className="modal-container"
        style={{
          padding: '0',
          boxShadow: '0 3px 10px rgba(0,0,0,.2)'
        }}
      >
        <div className={classNames('modal', className)}>
          {(title || showCloseButton) && (
            <div className="modal__header-bar">
              {title ? <h3 className="modal__title">{title}</h3> : <span />}
              {showCloseButton && (
                <IconButton className="modal__close-button" onClick={onClose}>
                  <VisuallyHidden>Close</VisuallyHidden>
                  <MdClose className="modal__close-button__icon" />
                </IconButton>
              )}
            </div>
          )}
          <div className="modal__content">{children}</div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}

Modal.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.any,
  showCloseButton: PropTypes.bool,
  title: PropTypes.any,
  className: PropTypes.string
};
