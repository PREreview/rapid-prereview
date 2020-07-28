import React from 'react';
import PropTypes from 'prop-types';

// hooks
import { useRole } from '../hooks/api-hooks';

// utils
import { unprefix } from '../utils/jsonld';

// components
import XLink from './xlink';

export default function ActiveUser({user}) {
  
  const [role] = useRole(user)

  return <>
    {role && role['@type'] !== 'AnonymousReviewerRole' ? <XLink to={`/about/${unprefix(user)}`}
      href={`/about/${unprefix(user)}`} >{role.name}</XLink> : <XLink to={`/about/${unprefix(user)}`}
        href={`/about/${unprefix(user)}`} >{`Community reviewer ${user.slice(user.length - 4, user.length)}`}</XLink>} 
  </>
}