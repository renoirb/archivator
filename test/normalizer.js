'use strict';

import assert from 'assert';

import slugs from '../src/normalizer/slugs';
import assets from '../src/normalizer/assets';
import hash from '../src/normalizer/hash';

import {csvRowRunner} from './utils';

function fieldArgumentSplitterAtSpace(input) {
  const args = input.split(' ');
  // assuming "assets" is the original function closure.
  return assets.apply(null, args);
}

const testSubjects = {slugs, assets: fieldArgumentSplitterAtSpace, hash};

const testCases = {};
testCases.slugs = {name: 'normalizer/slugs', data: require('./normalizer/slugs.csv')};
testCases.assets = {name: 'normalizer/assets', data: require('./normalizer/assets.csv')};
testCases.hash = {name: 'normalizer/hash', data: require('./normalizer/hash.csv')};

csvRowRunner(testCases, testSubjects);

/**
 * Let's test things tested above glued together
 */
describe('How files will be saved as:', () => { // eslint-disable-line no-undef
  it('At root', () => { // eslint-disable-line no-undef
    const archiveAndAssetPair = ['http://www.example.org/', 'A.PNG'];
    const slug = slugs(archiveAndAssetPair[0]);
    const asset = assets(...archiveAndAssetPair);
    const saveAs = slug + '/' + hash(asset);
    // console.log({slug, asset, saveAs}); // DEBUG
    assert.equal(saveAs, 'example.org/552099857503c456560454297a1f872d0f8a7a6f.png'); // eslint-disable-line no-undef
  });
});
