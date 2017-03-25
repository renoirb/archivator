'use strict';

import assert from 'assert';

import slugs from '../src/normalizer/slugs';
import assets from '../src/normalizer/assets';
import hash from '../src/normalizer/hash';

import {inputExpectedOutputStringsTests} from './utils';

function assetsArgumentStringSplitter(input) {
  const args = input.split(' ');
  return assets.apply(null, args);
}

const testSubjects = {slugs, assets: assetsArgumentStringSplitter, hash};

const testCases = {};
testCases.slugs = require('./normalizer/slugs.csv');
testCases.assets = require('./normalizer/assets.csv');
testCases.hash = require('./normalizer/hash.csv');

inputExpectedOutputStringsTests(testCases, testSubjects);

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
