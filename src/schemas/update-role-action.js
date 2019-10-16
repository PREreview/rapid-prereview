const schema = {
  $id: 'https://rapid.prereview.org/schemas/update-role-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'UpdateRoleAction'
    },
    actionStatus: {
      type: 'string',
      enum: [
        'PotentialActionStatus',
        'ActiveActionStatus',
        'CompletedActionStatus',
        'FailedActionStatus'
      ]
    },
    agent: {
      type: 'string',
      pattern: '^user:'
    },
    startTime: {
      type: 'string',
      format: 'date-time'
    },
    endTime: {
      type: 'string',
      format: 'date-time'
    },
    object: {
      type: 'string',
      pattern: '^role:'
    },
    payload: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        avatar: {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              const: 'ImageObject'
            },
            encodingFormat: {
              type: 'string',
              enum: ['image/jpeg', 'image/png']
            },
            contentUrl: {
              type: 'string',
              pattern: '^data:image/(png|jpeg);base64' // prettier-ignore eslint-ignore-line
            }
          },
          required: ['@type', 'encodingFormat', 'contentUrl'],
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object']
};

export default schema;
