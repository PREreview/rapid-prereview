const schema = {
  $id: 'https://rapid.prereview.org/schemas/register-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'RegisterAction'
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
      type: 'object',
      properties: {
        '@type': {
          type: 'string',
          const: 'Person'
        },
        name: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        orcid: {
          type: 'string'
        }
      },
      additionalProperties: false,
      required: ['@type', 'orcid']
    },
    startTime: {
      type: 'string',
      format: 'date-time'
    },
    endTime: {
      type: 'string',
      format: 'date-time'
    },
    token: {
      type: 'object',
      properties: {
        '@type': {
          type: 'string',
          const: 'AuthenticationToken'
        }
      },
      additionalProperties: true
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent']
};

export default schema;
