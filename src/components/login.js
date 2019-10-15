import React from 'react';
import HeaderBar from './header-bar';

export default function Login() {
  return (
    <div className="login">
      <HeaderBar />

      <a href="/auth/orcid">login with ORCID</a>
    </div>
  );
}
