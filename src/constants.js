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
  'url',
  'name',
  'preprintServer',
  'datePosted',
  'encoding'
];

// See https://github.com/PREreview/rapid-prereview/issues/10
export const DISEASES = [
  {
    name: 'Chikungunya',
    priority: 'orange'
  },
  {
    name: 'Cholera',
    priority: 'yellow'
  },
  {
    name: 'Crimean-Congo hemorrhagic fever',
    alternateName: 'CCHF',
    priority: 'red'
  },
  {
    name: 'Dengue',
    priority: 'yellow'
  },
  {
    name: 'Ebola',
    priority: 'red'
  },
  {
    name: 'Hendra',
    priority: 'red'
  },
  {
    name: 'Human immunodeficiency virus',
    alternateName: 'HIV',
    priority: 'yellow'
  },
  {
    name: 'Influenza',
    priority: 'yellow'
  },
  {
    name: 'Lassa',
    priority: 'red'
  },
  {
    name: 'Leishmaniasis',
    priority: 'yellow'
  },
  {
    name: 'Malaria',
    priority: 'yellow'
  },
  {
    name: 'Marburg',
    priority: 'red'
  },
  {
    name: 'Measles',
    priority: 'yellow'
  },
  {
    name: 'Middle East respiratory syndrome',
    alternateName: 'MERS',
    priority: 'red'
  },
  {
    name: 'Nipah',
    priority: 'red'
  },
  {
    name: 'Plague',
    priority: 'yellow'
  },
  {
    name: 'Rift Valley fever',
    alternateName: 'RVF',
    priority: 'red'
  },
  {
    name: 'Severe Acute Respiratory Syndrome',
    alternateName: 'SARS',
    priority: 'red'
  },
  {
    name: 'Severe Fever with Thrombocytopenia Syndrome',
    alternateName: 'SFTS',
    priority: 'orange'
  },
  {
    name: 'Smallpox',
    priority: 'yellow'
  },
  {
    name: 'Tuberculosis',
    priority: 'yellow'
  },
  {
    name: 'West Nile Virus',
    priority: 'yellow'
  },
  {
    name: 'Yellow fever',
    priority: 'yellow'
  },
  {
    name: 'Zika',
    priority: 'red'
  }
];
