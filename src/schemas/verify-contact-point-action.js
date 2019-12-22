const schema = {
  $id: 'https://rapid.prereview.org/schemas/verify-contact-point-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'VerifyContactPointAction'
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
    token: {
      type: 'object',
      properties: {
        '@type': {
          type: 'string',
          const: 'ContactPointVerificationToken'
        },
        value: {
          type: 'string'
        }
      },
      required: ['@type', 'value'],
      additionalProperties: false
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object', 'token']
};

export default schema;
