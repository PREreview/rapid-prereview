import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import { MdClose } from 'react-icons/md';
import IconButton from './icon-button';
import { CSS_SCOPE_ID } from '../constants';

export default function Modal({
  onClose = noop,
  title,
  showCloseButton = false,
  children,
  className,
  ...others
}) {
  /* !! we prefix the classes with rpos- as `modal` is a verry common classnames that clashes a lot in the extension (the modal is rendered in a portal in body so we are vulnerable) */

  return (
    <DialogOverlay onDismiss={onClose}>
      <DialogContent
        aria-label={
          others['aria-label'] ||
          (typeof title === 'string' ? title : undefined)
        }
        className="rpos-modal-container"
        style={{
          padding: '0',
          boxShadow: '0 3px 10px rgba(0,0,0,.2)'
        }}
      >
        <div id={CSS_SCOPE_ID}>
          <div className={classNames('rpos-modal', className)}>
            {(title || showCloseButton) && (
              <div className="rpos-modal__header-bar">
                {title ? (
                  <h3 className="rpos-modal__title">{title}</h3>
                ) : (
                  <span />
                )}
                {showCloseButton && (
                  <IconButton
                    className="rpos-modal__close-button"
                    onClick={onClose}
                  >
                    <VisuallyHidden>Close</VisuallyHidden>
                    <MdClose className="rpos-modal__close-button__icon" />
                  </IconButton>
                )}
              </div>
            )}
            <div className="rpos-modal__content">{children}</div>
          </div>
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
