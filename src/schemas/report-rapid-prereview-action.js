const schema = {
  $id: 'https://rapid.prereview.org/schemas/report-rapid-prereview-action.json',

  type: 'object',
  properties: {
    '@type': {
      type: 'string',
      const: 'ReportRapidPREreviewAction'
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
      pattern: '^review:'
    },
    moderationReason: {
      type: 'string'
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object']
};

export default schema;
