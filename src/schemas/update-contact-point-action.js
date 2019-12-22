const schema = {
  $id: 'https://rapid.prereview.org/schemas/update-contact-point-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'UpdateContactPointAction'
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
      pattern: '^contact:'
    },
    payload: {
      type: 'object',
      properties: {
        contactType: {
          type: 'string',
          const: 'notifications'
        },
        active: {
          type: 'boolean'
        },
        email: {
          type: 'string',
          pattern: '^mailto:'
        }
      },
      required: ['contactType', 'active'],
      additionalProperties: false
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object', 'payload']
};

export default schema;
