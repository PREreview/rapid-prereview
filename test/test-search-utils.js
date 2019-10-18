import assert from 'assert';
import querystring from 'querystring';
import { createPreprintQs } from '../src/utils/search';
import {
  arXivId,
  crossrefDoi,
  openAireDoi
} from './utils/create-preprint-server';

describe('search utils', () => {
  describe('createPreprintQs', () => {
    it('should create qs in the default case', () => {
      const { ui, api } = createPreprintQs();
      assert.equal(ui, undefined);
      assert(api.startsWith('?'));
    });

    it('should create qs in the bookmark case', () => {
      const { ui, api } = createPreprintQs({ bookmark: 'bookmark' });
      assert.equal(ui, '?bookmark=bookmark');
      assert.equal(api, '?bookmark=bookmark');
    });

    it('should create qs in the search case', () => {
      const { ui, api } = createPreprintQs({
        text: 'text',
        hasReviews: true,
        subjects: ['influenza', 'zika'],
        sort: 'new'
      });

      assert.equal(
        ui,
        '?q=text&reviews=true&sort=new&subject=influenza%2Czika'
      );

      const p = querystring.parse(api.substring(1));
      assert.equal(
        p.q,
        'name:text AND hasReviews:true AND (subjectName:"influenza" OR subjectName:"zika")'
      );
    });

    it('should handle DOI and arXivId', () => {
      const { ui, api } = createPreprintQs({
        text: `text ${arXivId} ${crossrefDoi} ${openAireDoi}`
      });
      assert(api.includes('+OR+doi') && api.includes('+OR+arXivId'));
    });
  });
});
