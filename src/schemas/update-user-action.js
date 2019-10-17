const schema = {
  $id: 'https://rapid.prereview.org/schemas/update-user-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'UpdateUserAction'
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
      pattern: '^user:'
    },
    payload: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        defaultRole: {
          type: 'string',
          pattern: '^role:'
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object', 'payload']
};

export default schema;
