'use strict';

const fs = require('fs');
const assert = require('assert');
const chai = require('chai');
const polyfills = require('babel-polyfill'); // eslint-disable-line no-unused-vars

/**
 * Make require support loading CSV
 * We want our CSV to use semicolumn (;) as separator
 */
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
 * See "Assertion description" above for for supported description.
 *
 * To test from CSV lines different input and outputs would require a refactor
 * let's keep this test as simple as possible.
 * Other type of tests may be best done without automation.
 */
const csvRowRunner = (useCases, subjectFunctions) => {
  return Object.getOwnPropertyNames(useCases).forEach(subjectFunctionName => {
    // Testing the test data input before running ’em
    // http://chaijs.com/api/bdd/
    const useCaseName = useCases[subjectFunctionName].name;
    const useCaseData = useCases[subjectFunctionName].data;
    chai.expect(useCaseName).to.be.a('string');
    chai.expect(useCaseData).to.be.an('array');
    describe(`${useCaseName}:`, () => { // eslint-disable-line no-undef
      useCaseData.forEach((fields, index) => {
        if (fields.length > 2) {
          /**
           * Assertion description
           *
           * Related to utils.js note.
           *
           * Each line in CSV file should be semicolumn separated fields:
           * - Function input String
           * - Expected function output String
           * - Explain what is Expected
           *
           * Contents of the CSV files may look like this:
           *
           * ```csv
           * http://example.org/ A.PNG;http://example.org/A.PNG;Case sensitive
           * http://example.org/a.png;6c65613db26a19d838c0.png;Add type extension at end of new hashed file name
           * http://example.org;example.org;Strips off protocol
           * ```
           * Lines above are one entry for assets.csv, hash.csv and slugs.csv, respectively.
           *
           * In the assertions sample above, notice first one has a space at the first element.
           * Except for the last field, we should have no spaces.
           * In the case of the first sample, we wanted to have more than one function input,
           * and we'll use space as a separator.
           *
           * To do that, we can have subjectFunctions[subjectFunctionName] (below) like this
           *
           * ```javascript
           * (i) => {
           *   // assuming "assets" is the original function closure.
           *   const args = i.split(' ');
           *   return assets.apply(null, args);
           * }
           * ```
           */
          const [input, expected, description] = fields;
          it(`${index}: ${description}`, () => { // eslint-disable-line no-undef
            assert.equal(subjectFunctions[subjectFunctionName].call(null, input), expected); // eslint-disable-line no-undef
          });
        }
      });
    });
  });
};

export {
  csvRowRunner // eslint-disable-line import/prefer-default-export
};
