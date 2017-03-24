'use strict';

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
