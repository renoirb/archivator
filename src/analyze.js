'use strict';

import * as fsa from 'async-file';

import {
  readFileWithErrorHandling,
  cheerioLoad
} from './common';

import dictionary from './lists/stopwords.en';

/**
 * https://www.ranks.nl/stopwords
 * http://xpo6.com/list-of-english-stop-words/
 */
const stopWords = new Set(dictionary);

function normalize(input) {
  const dto = String(input) || '';
  return dto.replace(/[^\w\s]|_/g, '').toLowerCase();
}

async function extractWords(recv, archivable) {
  const loaded = cheerioLoad(recv);
  return loaded.then(shard => {
    const truncate = archivable.truncate;
    shard(truncate).remove();
    const text = shard.text().split(' ');
    const words = Object.create(null);
    const foundOnce = new Set();
    for (let i = 0; i < text.length; i++) {
      const word = normalize(text[i]);
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

async function analyze(cacheFile, archivable) {
  const cacheExists = await fsa.exists(cacheFile);
  const data = Object.create(null);
  if (cacheExists === true) {
    const cacheData = await readFileWithErrorHandling(cacheFile);
    const words = await extractWords(cacheData, archivable);
    const {sorted, keywords} = await sortedAndKeywords(words);
    data.words = Object.assign({}, sorted);
    data.keywords = Object.assign({}, keywords);
  }

  return data;
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

async function sortedAndKeywords(words = {}) {
  const keywords = Object.create(null);
  const sorted = Object.create(null);
  const sorting = sort(words);
  const max = 10;
  let iter = 0;
  for (const popular of sorting) {
    const used = popular[1]; // word has been used n times
    const word = popular[0];
    if (iter <= max && used > 3) {
      keywords[word] = used;
    }
    sorted[word] = used;
    iter++;
  }

  const wordCount = Object.keys(words).length;
  let logLine = '  analysis:';
  console.log(logLine);
  logLine = '    words: ' + wordCount;
  console.log(logLine);
  const firstThreeKeywords = Object.keys(keywords).slice(0, 3).join(', ');
  logLine = '    keywords: ' + firstThreeKeywords;
  console.log(logLine);

  return {sorted, keywords};
}

async function write(file, data = {}, boolOverwrite = true) {
  const destExists = await fsa.exists(file);
  const contents = JSON.stringify(data);
  if (destExists === false || (destExists === true && boolOverwrite)) {
    await fsa.writeTextFile(file, contents, 'utf8');
  }

  return {file, contents};
}

export default async archivable => {
  const slug = archivable.slug;
  const path = `archive/${slug}`;
  const cacheFile = `${path}/document.html`;
  const file = `${path}/analyze.json`;
  return Promise.resolve(cacheFile)
    .then(cacheFile => analyze(cacheFile, archivable))
    .then(analyzed => write(file, analyzed));
};
