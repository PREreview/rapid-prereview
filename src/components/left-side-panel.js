import React from 'react';

export default function LeftSidePanel({ visible, children }) {
  return (
    <div
      className={`left-side-panel ${
        visible ? 'left-side-panel--visible' : 'left-side-panel--hidden'
      }`}
    >
      <div className="left-side-panel__content">
        <h2>left side panel</h2>

        {children}
      </div>
    </div>
  );
}
