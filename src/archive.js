'use strict';

import fetcher from './fetcher';
import transformer from './transformer';
import {readLines, handleIndexSourceErrors} from './common';

const URL_LIST = 'archive/index.csv';
const [...urls] = readLines(URL_LIST);

/**
 * Something is going somewhat as an anti-pattern here.
 * We want Promise.all(...) at each step, and it's not how
 * it is as of now. Needs rework here. TODO
 */
Promise.all(urls)
  .then(u => fetcher(u))
  .then(u => transformer(u))
  .catch(handleIndexSourceErrors);
