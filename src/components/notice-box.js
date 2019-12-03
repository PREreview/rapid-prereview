import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MdInfoOutline, MdErrorOutline } from 'react-icons/md';

export default function NoticeBox({ type = 'info', children }) {
  return (
    <div className={classNames('notice-box', `notice-box--${type}`)}>
      <div className="notice-box__icon-container">
        {type === 'info' && <MdInfoOutline className="notice-box__icon" />}
        {type === 'warning' && <MdErrorOutline className="notice-box__icon" />}
      </div>
      <div className="notice-box__message-container">
        <span className="notice-box__message">{children}</span>
      </div>
    </div>
  );
}

NoticeBox.propTypes = {
  type: PropTypes.oneOf(['info', 'warning']),
  children: PropTypes.node
};
