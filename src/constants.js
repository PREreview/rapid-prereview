// See https://github.com/PREreview/rapid-prereview/issues/6
export const QUESTIONS = [
  {
    identifier: 'ynCoherent',
    question: 'Do the findings support the conclusion?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynRecommend',
    question: 'Would you recommend this?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynRelevantPolicy',
    groupPrefix: 'ynRelevant',
    question: 'Is this relevant to policy?',
    type: 'YesNoQuestion'
  },
  {
    identifier: 'ynRelevantClinic',
    groupPrefix: 'ynRelevant',
    question: 'Is this relevant to clinic?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynNovel',
    question: 'Are the finding novel?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynBasisFuture',
    question: 'Is there a basis for future work?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynAttentionStats',
    groupPrefix: 'ynAttention',
    question: 'Is special attention needed for statistics?',
    type: 'YesNoQuestion'
  },
  {
    identifier: 'ynAttentionMethods',
    groupPrefix: 'ynAttention',
    question: 'Is special attention needed for methods?',
    type: 'YesNoQuestion'
  },
  {
    identifier: 'ynAttentionModel',
    groupPrefix: 'ynAttention',
    question: 'Is special attention needed for model?',
    type: 'YesNoQuestion'
  },
  {
    identifier: 'ynAttentionEthics',
    groupPrefix: 'ynAttention',
    question: 'Is special attention needed for ethics?',
    type: 'YesNoQuestion'
  },
  {
    identifier: 'ynAttentionData',
    groupPrefix: 'ynAttention',
    question: 'Is special attention needed for data quality?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynAvailableData',
    groupPrefix: 'ynAvailable',
    question: 'Are data available?',
    type: 'YesNoQuestion'
  },
  {
    identifier: 'ynAvailableCode',
    groupPrefix: 'ynAvailable',
    question: 'Is code available?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'ynLimitations',
    question: 'Does the paper discuss limitations?',
    type: 'YesNoQuestion'
  },
  //
  {
    identifier: 'cMethods',
    question: 'Technical comments on methods, data and limitations',
    type: 'Question'
  },
  {
    identifier: 'cRelevance',
    question: 'Technical comments on novelty, importance, relevance',
    type: 'Question'
  }
];

export const INDEXED_PREPRINT_PROPS = [
  '@id',
  '@type',
  'doi',
  'arXivId',
  'name',
  'preprintServer',
  'datePosted'
];
