'use strict';

const fs = require('fs');
const assert = require('assert');
const polyfills = require('babel-polyfill'); // eslint-disable-line no-unused-vars

require.extensions['.csv'] = function (module, filename) {
  const fileContents = fs.readFileSync(filename, 'utf8');
  module.exports = fileContents.split('\n').filter(e => e !== '').map(line => line.split(';'));
};

const csvDrivenTests = (useCases, subjectFunctions) => {
  /**
   * Run the tests!
   *
   * Section above should contain a list of use-cases
   * for each function we want to test.
   */
  return Object.getOwnPropertyNames(useCases).forEach(subjectFunctionName => {
    describe(subjectFunctionName, () => { // eslint-disable-line no-undef
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
  csvDrivenTests // eslint-disable-line import/prefer-default-export
};
