'use strict';

import fetcher from './fetcher';
import transformer from './transformer';
import {readLines, handleIndexSourceErrors} from './common';

const URL_LIST = 'archive/index.csv';

const [...urls] = readLines(URL_LIST);

/**
 * Something is going somewhat as an anti-pattern here.
 * Gotta wire generator and async/await TODO
 */
Promise.all(urls)
  .then(u => fetcher(u))
  .then(u => transformer(u))
  .catch(handleIndexSourceErrors);
