'use strict';

import * as fsa from 'async-file';

import {
  readLines,
  handleIndexSourceErrors,
  readCached,
  figureOutTruncateAndSelector,
  cheerioLoad
} from './common';

import {stopWords} from './stopwords';

const URL_LIST = 'archive/index.csv';
const OVERWRITE = true;

function removePunctuation(input) {
  return input.replace(/[^\w\s]|_/g, '');
}

async function extractWords(recv, source) {
  const loaded = cheerioLoad(recv);
  return loaded.then(shard => {
    const {_, truncate} = figureOutTruncateAndSelector(source);
    shard(truncate).remove();
    const text = shard.text().split(' ');
    const words = Object.create(null);
    const foundOnce = new Set();
    for (let i = 0; i < text.length; i++) {
      const w = removePunctuation(text[i]).toLowerCase();
      if (/^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/.test(w) && stopWords.has(w) === false) {
        if (foundOnce.has(w)) {
          if (Object.prototype.hasOwnProperty.call(words, w)) {
            words[w]++;
          } else {
            words[w] = 2;
          }
        } else {
          foundOnce.add(w);
        }
      }
    }
    return words;
  });
}

async function read(source) {
  const path = `archive/${source.slug}`;
  const cache = `${path}/cache.html`;
  const targetFileName = `${path}/analyze.json`;
  const cacheExists = await fsa.exists(cache);
  const data = {};
  if (cacheExists === true) {
    const cached = await readCached(cache);
    const words = await extractWords(cached, source);
    data.words = words;
  }

  return {file: targetFileName, data};
}

function sort(subject) {
  let sortable = [];
  for (let key in subject) {
    sortable.push([key, subject[key]]);
  }
  // Sort from more occurences, to least
  sortable.sort((a, b) => {
    return -1 * (a[1] - b[1]);
  });

  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

async function analyze(recv) {
  const words = recv.data.words;
  const keywords = Object.create(null);
  const sorted = sort(words);
  const max = 10;
  let iter = 0;
  for (let popular of sorted) {
    let used = popular[1]; // word has been used n times
    let word = popular[0];
    if (iter <= max && used > 3) {
      keywords[word] = used;
    }
    iter++;
  }

  recv.data.keywords = keywords;

  return recv;
}

async function write({file, data = {}}, boolOverwrite = false) {
  const destExists = await fsa.exists(file);
  if (destExists === false || (destExists === true && boolOverwrite)) {
    await fsa.writeTextFile(file, JSON.stringify(data), 'utf8');
  }

  return {file, data};
}

/**
 * Something is going somewhat as an anti-pattern here.
 * We want Promise.all(...) at each step, and it's not how
 * it is as of now. Needs rework here. TODO
 */
for (const url of readLines(URL_LIST)) {
  Promise.resolve(url)
    .then(u => read(u))
    .then(descriptor => analyze(descriptor))
    .then(descriptor => write(descriptor, OVERWRITE))
    .catch(handleIndexSourceErrors);
}
