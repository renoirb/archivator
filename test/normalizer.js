'use strict';

import slugs from '../src/normalizer/slugs';
import assets from '../src/normalizer/assets';
import {inputExpectedOutputStringsTests} from './utils';

function assetsArgumentStringSplitter(input) {
  const args = input.split(' ');
  return assets.apply(null, args);
}

const testSubjects = {slugs, assets: assetsArgumentStringSplitter};

const testCases = {};
testCases.slugs = require('./normalizer/slugs.csv');
testCases.assets = require('./normalizer/assets.csv');

inputExpectedOutputStringsTests(testCases, testSubjects);
