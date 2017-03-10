'use strict';

const fs = require('fs');
const assert = require('assert');
const polyfills = require('babel-polyfill'); // eslint-disable-line no-unused-vars

require.extensions['.csv'] = function (module, filename) {
  const fileContents = fs.readFileSync(filename, 'utf8');
  module.exports = fileContents.split('\n').filter(e => e !== '').map(line => line.split(';'));
};

/*
 * Input and Expected Output as Strings (only) Tests
 *
 * Loop from a three fields per line CSV file.
 * One use-case per assertion test.
 *
 * Idea here is that the author plan to rewrite this system
 * into another language and wants the tests to remain the same
 * and be imported using the same data.
 *
 * Format currently only support three fields:
 * - Input String
 * - Expected output String
 * - Explain what is Expected
 *
 * To test from CSV lines different input and outputs would require a refactor
 * let's keep this test as simple as possible.
 * Other type of tests may be best done without automation.
 */
const inputExpectedOutputStringsTests = (useCases, subjectFunctions) => {
  return Object.getOwnPropertyNames(useCases).forEach(subjectFunctionName => {
    describe(`${subjectFunctionName}:`, () => { // eslint-disable-line no-undef
      const assertions = useCases[subjectFunctionName];
      assertions.forEach((fields, index) => {
        if (fields.length > 2) {
          const [url, expected, description] = fields;
          it(`${index}: ${description}`, () => { // eslint-disable-line no-undef
            assert.equal(expected, subjectFunctions[subjectFunctionName].call(null, url)); // eslint-disable-line no-undef
          });
        }
      });
    });
  });
};

export {
  inputExpectedOutputStringsTests // eslint-disable-line import/prefer-default-export
};
