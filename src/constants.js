// See https://github.com/PREreview/rapid-prereview/issues/6
// When possible questions are written so that yes means "the preprint is good"
export const QUESTIONS = [
  {
    identifier: 'ynNovel',
    question: 'Are the findings novel?',
    help:
      'In your judgement, does the manuscript have information that has not been previously known or published?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynCoherent',
    question:
      'Are the principal conclusions supported by the data and analysis?',
    help:
      'Is there sufficient evidence to support the key findings of the manuscript?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynFuture',
    question: 'Are the results likely to lead to future research?',
    help:
      'Do the data, findings, or analysis point to clear directions for additional research?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynEthics',
    question: 'Have the authors adequately discussed ethical concerns',
    help:
      'For example, if a human study, is Institutional Review Board (IRB) approval presented?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynLimitations',
    question: 'Does the manuscript discuss limitations?',
    help: 'Are the most important limitations clearly presented?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynNewData',
    question: 'Does the manuscript include new data?',
    help: 'Were data collected or made available specifically for this study?',
    type: 'YesNoQuestion',
    required: true
  },

  //
  {
    identifier: 'ynAvailableData', // DO NOT CHANGE THIS IS USED IN THE INDEX (or update everywhere)
    indexed: true,
    question: 'Are the data used in the manuscript available?',
    help:
      'In the paper, supplement, on a public repository, or from a cited source?',
    type: 'YesNoQuestion',
    required: true
  },
  {
    identifier: 'ynAvailableCode', // DO NOT CHANGE THIS IS USED IN THE INDEX (or update everywhere)
    indexed: true,
    question: 'Is the code used in the manuscript available?',
    help:
      'In the paper, supplement, on a public repository, or from a cited source?',
    type: 'YesNoQuestion',
    required: true
  },

  //
  {
    identifier: 'ynReproducibility',
    question:
      'Is sufficient detail provided to allow reproduction of the study?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynMethods',
    question: 'Are the methods and statistics appropriate for the analysis?',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynRecommend',
    question: 'Would you recommend this manuscript to others?',
    help:
      'Consider any possible audience: scientists in the same field or others, policy makers, the public, etc.',
    type: 'YesNoQuestion',
    required: true
  },

  {
    identifier: 'ynPeerReview',
    question: 'Do you recommend this manuscript for peer review?',
    help:
      'Would you recommend this manuscript to a journal editor for formal peer review?',
    type: 'YesNoQuestion',
    required: true
  },

  //
  {
    identifier: 'cMethods',
    question: 'Technical comments on methods, data, limitations',
    type: 'Question',
    required: false
  },
  {
    identifier: 'cRelevance',
    question: 'Editorial comments on novelty, importance, relevance',
    type: 'Question',
    required: false
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

// messaging for the web extension
export const CHECK_SESSION_COOKIE = 'CHECK_SESSION_COOKIE';
export const SESSION_COOKIE_CHANGED = 'SESSION_COOKIE_CHANGED';
export const CHECK_PREPRINT = 'CHECK_PREPRINT';
export const SESSION_COOKIE = 'SESSION_COOKIE';
export const PREPRINT = 'PREPRINT';
export const TOGGLE_SHELL_TAB = 'TOGGLE_SHELL_TAB';

export const CONTACT_EMAIL_HREF = 'mailto:contact@outbreaksci.prereview.org';
export const PRODUCTION_DOMAIN = 'https://rapid-prereview.azurewebsites.net'; // 'https://oubreaksci.prereview.org'

export const CSS_HEADER_HEIGHT = 72;
export const CSS_SCOPE_ID = 'rpos-ext'; // keep in sync with webpack-extension.config.js

export const ORG = 'Outbreak Science Rapid PREreview';
