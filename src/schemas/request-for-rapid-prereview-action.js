const schema = {
  $id:
    'https://rapid.prereview.org/schemas/request-for-rapid-prereview-action.json',
  definitions: {
    text: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            '@type': {
              type: 'string',
              const: 'rdf:HTML'
            },
            '@value': {
              type: 'string'
            }
          },
          required: ['@type', '@value']
        }
      ]
    }
  },

  type: 'object',
  properties: {
    '@id': {
      type: 'string',
      pattern: '^request:'
    },
    '@type': {
      type: 'string',
      const: 'RequestForRapidPREreviewAction'
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
      oneOf: [
        {
          type: 'string',
          pattern: '^doi:|^arXiv:'
        },
        {
          type: 'object',
          properties: {
            '@id': {
              type: 'string',
              pattern: '^doi:|^arXiv:'
            },
            '@type': { type: 'string', const: 'ScholarlyPreprint' },
            doi: {
              type: 'string'
            },
            arXivId: {
              type: 'string'
            },
            url: {
              type: 'string',
              format: 'uri',
              pattern: '^https?://'
            },
            name: { $ref: '#/definitions/text' },
            datePosted: {
              type: 'string',
              format: 'date-time'
            },
            preprintServer: {
              type: 'object',
              properties: {
                '@type': { type: 'string', const: 'PreprintServer' },
                name: { type: 'string' }
              }
            }
          },
          required: ['@id']
        }
      ]
    },
    resultRequest: {
      type: 'object',
      properties: {
        '@id': {
          type: 'string',
          pattern: '^node:|^_:'
        },
        '@type': {
          type: 'string',
          const: 'RequestForRapidPREreview'
        },
        dateCreated: {
          type: 'string',
          format: 'date-time'
        },
        about: {
          type: 'array',
          description: 'subjects from list of infectious diseases',
          items: {
            type: 'object',
            properties: {
              '@type': {
                type: 'string',
                const: 'OutbreakScienceEntity'
              },
              name: {
                type: 'string'
              }
            }
          }
        },
      },
      additionalProperties: false,
      required: ['@type', 'reviewAnswer']  
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object', 'resultRequest']
};

export default schema;
