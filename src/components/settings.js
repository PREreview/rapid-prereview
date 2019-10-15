import React from 'react';
import { useUser } from '../contexts/user-context';
import SettingsRoles from './settings-roles';
import HeaderBar from './header-bar';

export default function Settings() {
  const [user] = useUser();

  return (
    <div className="settings">
      <HeaderBar />

      <h2>Settings</h2>

      <dl>
        <dt>ORCID:</dt>
        <dd>
          <a href={`https://orcid.org/${user.orcid}`}>{user.orcid}</a>
        </dd>
      </dl>

      <SettingsRoles user={user} />
    </div>
  );
}
