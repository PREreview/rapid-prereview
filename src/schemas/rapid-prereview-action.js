const schema = {
  $schema: 'https://json-schema.org/schema#',
  $id: 'https://rapid.prereview.org/schemas/rapid-prereview-action.json',
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
      pattern: '^action:' // TODO action:<orcid>@<doi>
    },
    '@type': {
      type: 'string',
      const: 'RapidPREreviewAction'
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
      pattern: '^doi:|^arXiv:'
    },
    resultReview: {
      type: 'object',
      properties: {
        '@id': {
          type: 'string',
          pattern: '^node:|^_:'
        },
        '@type': {
          type: 'string',
          const: 'RapidPREreviewAction'
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
        reviewAnswer: {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  '@type': { type: 'string', const: 'Answer' },
                  parentItem: {
                    type: 'object',
                    properties: {
                      '@type': {
                        type: 'string',
                        const: 'Question'
                      },
                      text: { $ref: '#/definitions/text' }
                    },
                    required: ['@type', 'text']
                  },
                  text: { $ref: '#/definitions/text' }
                }
              },

              {
                type: 'object',
                properties: {
                  '@type': { type: 'string', const: 'YesNoAnswer' },
                  parentItem: {
                    type: 'object',
                    properties: {
                      '@type': {
                        type: 'string',
                        const: 'YesNoQuestion'
                      },
                      text: { $ref: '#/definitions/text' },
                      suggestedAnswer: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            '@type': {
                              type: 'string',
                              const: 'Answer'
                            },
                            text: {
                              type: 'string'
                            }
                          },
                          required: ['@type', 'text']
                        }
                      }
                    },
                    required: ['@type', 'text']
                  },
                  text: { $ref: '#/definitions/text' }
                }
              }
            ]
          }
        }
      },
      additionalProperties: false,
      required: ['@type', 'reviewAnswer']
    }
  },
  additionalProperties: false,
  required: ['@type', 'actionStatus', 'agent', 'object', 'resultReview']
};

export default schema;
