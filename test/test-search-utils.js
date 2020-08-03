import assert from 'assert';
import querystring from 'querystring';
import { createPreprintQs, apifyPreprintQs } from '../src/utils/search';
import {
  arXivId,
  crossrefDoi,
  openAireDoi
} from './utils/create-preprint-server';

describe('search utils', () => {
  describe('createPreprintQs and apifyPreprintQs', () => {
    it('should create qs in the default case', () => {
      const ui = createPreprintQs();
      assert.equal(ui, undefined);
      assert(apifyPreprintQs(ui).startsWith('?'));
    });

    it('should create qs in the bookmark case', () => {
      const ui = createPreprintQs();
      assert(apifyPreprintQs(ui, 'bookmark').includes('bookmark=bookmark'));
    });

    it('should create qs in the search case', () => {
      const ui = createPreprintQs({
        text: 'text',
        hasReviews: true,
        subjects: ['influenza', 'zika'],
        sort: 'new'
      });

      assert.equal(
        ui,
        '?q=text&reviews=true&sort=new&subject=influenza%2Czika'
      );

      const p = querystring.parse(apifyPreprintQs(ui).substring(1));
      assert.equal(
        p.q,
        '(name:"text" OR name:text*) AND hasReviews:true AND (subjectName:"influenza" OR subjectName:"zika")'
      );
    });

    it('should allow multiple terms to be used', () => {
      const ui = createPreprintQs({ text: ['text1', 'text2'] });

      assert.equal(ui, '?q=text1&q=text2');

      const p = querystring.parse(apifyPreprintQs(ui).substring(1));
      assert.equal(p.q, '(name:"text1" OR name:text1* OR name:"text2" OR name:text2*)' );
    });

    it('should handle DOI and arXivId', () => {
      const ui = createPreprintQs({
        text: `text ${arXivId} ${crossrefDoi} ${openAireDoi}`
      });
      const api = apifyPreprintQs(ui);
      assert(api.includes('+OR+doi') && api.includes('+OR+arXivId'));
    });
  });
});
