import assert from 'assert';
import { unversionDoi } from '../src/utils/ids';

describe('ids utils', function() {
  describe('unversionDoi', () => {
    it('should remove version suffix from a DOI', () => {
      const doi = '10.1101/608653v3';

      assert.equal(unversionDoi(doi), '10.1101/608653');
    });

    it('should work with a non versioned DOI', () => {
      const doi = '10.1101/608653';

      assert.equal(unversionDoi(doi), '10.1101/608653');
    });

    it('should work with a non DOI', () => {
      const doi = 'not-a-doi';

      assert.equal(unversionDoi(doi), null);
    });
  });
});
