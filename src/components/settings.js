import React from 'react';
import { useUser } from '../contexts/user-context';
import SettingsRoles from './settings-roles';
import HeaderBar from './header-bar';

export default function Settings() {
  const [user] = useUser();

  return (
    <div className="settings">
      <HeaderBar />

      <section className="settings__section">
        <h2 className="settings__title">Profile Settings</h2>
        <dl className="settings__info-list">
          <dt className="settings__info-list__term">ORCID:</dt>
          <dd className="settings__info-list__def">
            <a href={`https://orcid.org/${user.orcid}`}>{user.orcid}</a>
          </dd>
        </dl>
      </section>

      <SettingsRoles user={user} />
    </div>
  );
}
