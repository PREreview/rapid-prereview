import React from 'react';
import HeaderBar from './header-bar';

// TODO:
// - other public persona + number of private persona
// - latest activity (with counts of rapid PREreviews and counts of request for rapid PREreviews)

export default function Profile() {
  return (
    <div className="profile">
      <HeaderBar />

      <h2>Profile</h2>
    </div>
  );
}
