import React from 'react';
import { useUser } from '../contexts/user-context';
import SettingsRoles from './settings-roles';

export default function Settings() {
  const [user] = useUser();

  return (
    <div>
      <h2>Settings</h2>

      <SettingsRoles user={user} />
    </div>
  );
}
