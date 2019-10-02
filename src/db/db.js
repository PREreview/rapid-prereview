export default class DB {
  constructor() {}

  async get(id) {}

  async search(query) {}

  async post(action) {
    if (!action['@type']) {
      throw new Error('action must have a @type');
    }

    switch (action['@type']) {
      case 'RapidPREreviewAction':
        break;
      case 'RequestForRapidPREreviewAction':
        break;
      default:
        break;
    }
  }
}
