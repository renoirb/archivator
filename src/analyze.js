'use strict';

import * as fsa from 'async-file';

import {
  readLines,
  handleIndexSourceErrors,
  readCached,
  figureOutTruncateAndSelector,
  cheerioLoad
} from './common';

/**
 * https://www.ranks.nl/stopwords
 * http://xpo6.com/list-of-english-stop-words/
 */
const stopWords = new Set(require('./stopwords'));

const URL_LIST = 'archive/index.csv';
const OVERWRITE = true;

function transformText(input) {
  const dto = String(input) || '';
  return dto.replace(/[^\w\s]|_/g, '').toLowerCase();
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
      const word = transformText(text[i]);
      const withinCharRange = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/.test(word);
      const isNotStopWord = stopWords.has(word) === false;
      const hasAtLeastTwo = word.length > 1;
      if (withinCharRange && isNotStopWord && hasAtLeastTwo) {
        if (foundOnce.has(word) === false) {
          foundOnce.add(word);
        } else if (Object.prototype.hasOwnProperty.call(words, word)) {
          words[word]++;
        } else {
          words[word] = 2;
        }
      }
    }
    return words;
  });
}

async function read(source) {
  const path = `archive/${source.slug}`;
  const cacheFile = `${path}/cache.html`;
  const targetFileName = `${path}/analyze.json`;
  const cacheExists = await fsa.exists(cacheFile);
  const data = Object.create(null);
  if (cacheExists === true) {
    const cacheData = await readCached(cacheFile);
    const words = await extractWords(cacheData, source);
    data.words = words;
  }

  console.log(`\nProcessing ${path}`);
  return {file: targetFileName, data};
}

function sort(subject = {}) {
  const sortable = [];
  for (const key in subject) {
    if (typeof key === 'string') {
      sortable.push([key, subject[key]]);
    }
  }
  // Sort from more occurences, to least
  sortable.sort((a, b) => {
    return -1 * (a[1] - b[1]);
  });

  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

async function analyze(recv) {
  const words = recv.data.words || {};
  const keywords = Object.create(null);
  const sorted = sort(words);
  const max = 10;
  let iter = 0;
  for (const popular of sorted) {
    const used = popular[1]; // word has been used n times
    const word = popular[0];
    if (iter <= max && used > 3) {
      keywords[word] = used;
    }
    iter++;
  }

  const wordCount = Object.keys(words).length;
  const paddedCounter = String(wordCount).padStart('5', ' ');
  let logLine = paddedCounter + ' words found';
  console.log(logLine);
  const firstThreeKeywords = Object.keys(keywords).slice(0, 3).join(', ');
  logLine = '      Top keywords: ' + firstThreeKeywords;
  console.log(logLine);

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
