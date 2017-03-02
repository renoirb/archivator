'use strict';

import {urlToSlug} from '../src/common';

const assert = require('assert');
const polyfills = require('babel-polyfill'); // eslint-disable-line no-unused-vars

const useCases = {};

/*
 * List use-cases per function to test.
 *
 * Idea here is that the author plan to rewrite this system
 * into another language and wants the tests to remain the same
 * and be imported using the same data
 */
useCases.urlToSlug = `
http://example.org;example.org;Strips off protocol
http://example.org/;example.org;Strips off trailing slash
http://example.org/foo/bar/;example.org/foo/bar;Keeps path as-is
http://example.org/Foo/bAr/;example.org/foo/bar;Makes everything lowercase
http://example.org/foo.html/;example.org/foo;Removes .html extension
http://example.org/foo.asp/;example.org/foo;Removes .asp extension
http://example.org/foo.aspx/;example.org/foo;Removes .aspx extension
http://example.org/foo.action?bar=bazz;example.org/foo/bar/bazz;Removes .action from path name
http://example.org/foo.fcgi?bar=bazz;example.org/foo/bar/bazz;Removes .fcgi from path name
http://example.org/user/john%40doe.org;example.org/user/john_at_doe.org;Replaces URL encoded %40 with _at_
http://example.org/foo?page=abc;example.org/foo/page/abc;Makes ?page query string parameter as a path name
http://example.org/foo?pageId=def;example.org/foo/page/def;Makes ?pageId query string parameter as page path name
http://example.org/foo?pageId=ghi&foo;example.org/foo/page/ghi;Makes ?pageId query string parameter as page path name and strips off empty argument
https://docs.webplatform.org/css/functions/matrix();docs.webplatform.org/css/functions/matrix;Strips off parenthesis from path name
https://docs.webplatform.org/wiki/Category:Topics;docs.webplatform.org/wiki/category/topics;Replaces column (:) into slash (/) from path name
https://docs.webplatform.org/wiki/css/selectors/pseudo-classes/:required;docs.webplatform.org/wiki/css/selectors/pseudo-classes/required;Removes column (:) from the URL when not used as separator
https://webplatform.org/;webplatform.org;Strips off www from host name
https://docs.webplatform.org/wiki/html/elements/!DOCTYPE/ja;docs.webplatform.org/wiki/html/elements/doctype/ja;Puts URL into lowercase, and removes non ASCII exclamation (!)
https://docs.webplatform.org/wiki/css/selectors/pseudo-classes/:nth-of-type(n);docs.webplatform.org/wiki/css/selectors/pseudo-classes/nth-of-typen;Removes column (:) and parenthesis in path name, even when parenthesis has something in them
https://docs.webplatform.org/wiki/html/attributes/border_(frameSet,_iframe);docs.webplatform.org/wiki/html/attributes/border_frameset_iframe;Removes comas from path name and parenthesis
https://example.org/bogus//double/slash;example.org/bogus/double/slash;Removes duplicate slashes
https://example.org/foo/?a=1&b=2;example.org/foo/a/1/b/2;Rewrites search parameters as if they were a path
https://example.org/foo/?b=2&a=1;example.org/foo/a/1/b/2;Rewrites search parameters as if they were a path, in alphebatical order
https://example.org/foo/?b=2&c=&a=1;example.org/foo/a/1/b/2;Filter out empty search query string members
https://example.org/foo/?b=2&a=1&c;example.org/foo/a/1/b/2;Filter out empty search query string members, even without equal sign
https://example.org/foo?b=2&a=1&c;example.org/foo/a/1/b/2;Supports path name with or without trailing slash when with a query string
https://medium.com/@sachagreif/the-state-of-javascript-front-end-frameworks-1a2d8a61510;medium.com/sachagreif/the-state-of-javascript-front-end-frameworks;Remove at sign (@) and random appended hash from URL path name
`;

/**
 * Run the tests!
 *
 * Section above should contain a list of use-cases
 * for each function we want to test.
 */

Object.getOwnPropertyNames(useCases).forEach(useCaseMethodName => {
  describe(useCaseMethodName, () => { // eslint-disable-line no-undef
    const assertions = useCases[useCaseMethodName].split('\n').filter(e => e !== '');
    assertions.forEach((row, index) => {
      const fields = row.split(';');
      if (fields.length > 2) {
        const [url, expected, description] = fields;
        it(`${index}: ${description}`, () => { // eslint-disable-line no-undef
          assert.equal(expected, urlToSlug(url)); // eslint-disable-line no-undef
        });
      }
    });
  });
});
