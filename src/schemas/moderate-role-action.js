const schema = {
  $id: 'https://rapid.prereview.org/schemas/moderate-role-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'ModerateRoleAction'
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
    moderationReason: {
      type: 'string'
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object']
};

export default schema;
