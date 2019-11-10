const schema = {
  $id:
    'https://rapid.prereview.org/schemas/moderate-rapid-prereview-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'ModerateRapidPREReviewAction'
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
      pattern: '^role:'
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
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object']
};

export default schema;
