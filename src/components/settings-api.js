import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { getId } from '../utils/jsonld';
import Org from './org';
import XLink from './xlink';
import Controls from './controls';
import Button from './button';
import { usePostAction } from '../hooks/api-hooks';

export default function SettingsApi({ user }) {
  const [post, postProgress] = usePostAction();

  const handleSubmit = useCallback(() => {
    post({
      '@type': 'CreateApiKeyAction',
      actionStatus: 'CompletedActionStatus',
      agent: getId(user),
      object: getId(user)
    });
  }, [post, user]);

  return (
    <section className="settings-api settings__section">
      <h3 className="settings__title">API key</h3>

      <p>
        An API key lets you create requests for reviews using the <Org />{' '}
        <XLink href="/api" to="/api">
          API
        </XLink>
        .
      </p>

      {user.apiKey ? (
        <div>
          <p>
            <Secret value={user.apiKey.value} />
          </p>

          <Controls error={postProgress.error}>
            <Button
              onClick={handleSubmit}
              disabled={postProgress.isActive}
              isWaiting={postProgress.isActive}
            >
              Regenerate API key
            </Button>
          </Controls>
        </div>
      ) : (
        <div>
          <Controls error={postProgress.error}>
            <Button
              onClick={handleSubmit}
              disabled={postProgress.isActive}
              isWaiting={postProgress.isActive}
            >
              Create API key
            </Button>
          </Controls>
        </div>
      )}
    </section>
  );
}

SettingsApi.propTypes = {
  user: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.oneOf(['Person']).isRequired,
    apiKey: PropTypes.shape({
      '@type': PropTypes.oneOf(['ApiKey']).isRequired,
      value: PropTypes.string.isRequired
    })
  }).isRequired
};

function Secret({ value, defaultIsVisible = false }) {
  const [isVisible, setIsVisible] = useState(defaultIsVisible);

  const [prefix, ...others] = value.split('-');
  const suffix = others.join('-');

  const displayedValue = isVisible
    ? value
    : `${value.substring(0, prefix.length)}-${'∙'.repeat(suffix.length)}`;

  return (
    <span className="settings-api__secret">
      <code>{displayedValue}</code>

      <Button
        onClick={() => {
          setIsVisible(!isVisible);
        }}
      >
        {isVisible ? 'Hide' : 'View'}
      </Button>
    </span>
  );
}

Secret.propTypes = {
  value: PropTypes.string.isRequired,
  defaultIsVisible: PropTypes.bool
};
