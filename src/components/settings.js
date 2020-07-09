import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../contexts/user-context';
import SettingsRoles from './settings-roles';
import SettingsApi from './settings-api';
import SettingsNotifications from './settings-notifications';
import HeaderBar from './header-bar';
import { ORG } from '../constants';

export default function Settings() {
  const [user] = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="settings">
      <Helmet>
        <title>{ORG} • Settings</title>
      </Helmet>

      <HeaderBar closeGap />
      <div className="settings__content">
        <section className="settings__section">
          <h2 className="settings__title">User Settings</h2>
          <dl className="settings__info-list">
            <dt className="settings__info-list__term">ORCID:</dt>
            <dd className="settings__info-list__def">
              <a href={`https://orcid.org/${user.orcid}`}>{user.orcid}</a>
            </dd>
          </dl>
        </section>

        <SettingsRoles user={user} />
        <SettingsNotifications user={user} />
        <SettingsApi user={user} />
      </div>
    </div>
  );
}
