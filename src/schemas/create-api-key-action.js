const schema = {
  $id: 'https://rapid.prereview.org/schemas/create-api-key-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'CreateApiKeyAction'
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
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object']
};

export default schema;
