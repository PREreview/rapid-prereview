import { harvestHTML } from '../test/utils/create-preprint-server';

const identifiers = [
  'arXiv:1909.13766',
  'arXiv:1910.00274',
  'arXiv:1910.00585',
  'arXiv:1910.06444',
  'doi:10.1101/19001834',
  'doi:10.1101/19007971',
  'doi:10.1101/674655',
  'doi:10.1101/780627',
  'doi:10.1101/782680',
  'doi:10.1101/788968',
  'doi:10.1101/790493',
  'doi:10.1101/790642',
  'doi:10.1101/791004',
  'doi:10.1101/791038',
  'doi:10.5281/zenodo.3356153'
];

(async function() {
  for (const identifier of identifiers) {
    await harvestHTML(identifier);
  }
})();
