import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useActionsSearchResults } from '../hooks/api-hooks';

export default function RoleActivity({ roleId }) {
  const [query, setQuery] = useState(
    `?q=agentId:"${roleId}"&sort=${JSON.stringify([
      '-startTime<number>'
    ])}&include_docs=true&counts=${JSON.stringify(['@type'])}`
  );

  const [results, progress] = useActionsSearchResults(query);

  return (
    <div>
      hello activity
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}

RoleActivity.propTypes = {
  roleId: PropTypes.string.isRequired
};
