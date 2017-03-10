'use strict';

import slugifier from '../src/normalizer/path';
import {inputExpectedOutputStringsTests} from './utils';

const testSubjects = {slugifier};

const testCases = {};
testCases.slugifier = require('./normalizer/path.csv');

inputExpectedOutputStringsTests(testCases, testSubjects);
