'use strict';

import {slugifier} from '../src/common';
import {csvDrivenTests} from './common';

const csvContents = require('./slugifier.csv');

const methodName = 'slugifier';
const subjects = {slugifier};

const useCases = {};
useCases[methodName] = csvContents;

/*
 * List use-cases per function to test.
 *
 * Idea here is that the author plan to rewrite this system
 * into another language and wants the tests to remain the same
 * and be imported using the same data
 */
csvDrivenTests(useCases, subjects);
