# [@archivator/content-divinator][repo-url]

> Attempt at guessing stuff, summarize content, based on raw text. A naïve Natural Language Processing toolkit.

This is, by no means, an actual attempt at Machine Learning.
It’s simply a few helpers to help automate maintenance of metadata from imported content.

[repo-url]: https://github.com/renoirb/archivator/blob/v3.x-dev/libraries/content-divinator 'Content Divinator'

## Usage

_See also_ [API Extractor generated docs](../../common/reviews/api/content-divinator.api.md)

### ContentDivinator

```js
import { ContentDivinator, utils } from '@archivator/content-divinator'

/**
 * Input text to parse.
 * Let’s say we want to know the most used words
 * so we can guess what it is about
 */
const textContent = `
  How much wood would a woodchuck chuck
  if a woodchuck could chuck wood?
  He would chuck, he would, as much as he could,
  and chuck as much wood as a woodchuck would
  if a woodchuck could chuck wood.
`

/**
 * What we want is to count word usage.
 *
 * Let’s say, we’d want to get the following knowledge
 * from the above text.
 *
 * We do not need words such as: a,if,He, they don’t bring any value.
 * They’re called "Stop words".
 * They're different for each language.
 */
const desiredTextHashMap = {
  chuck: 5,
  woodchuck: 4,
  wood: 4,
}

/**
 * Stop Words are words that are mostly noise when
 * we try to analyze what it is about.
 *
 * For this purpose, a "word" are letters and numbers in sequence.
 *
 * Notice in stopWords, we're not adding 'that', it is present 3 times in the text above.
 */
const stopWords = ['a', 'as', 'could', 'he', 'how', 'if', 'much', 'would']
const divinator = new ContentDivinator(stopWords)
/** @type {Map<string, number>} */
const textMap = divinator.words(sourceDocumentText)
console.log(textMap)
// > Map { 'chuck' => 5, 'woodchuck' => 4, 'wood' => 4 }
// Convert ECMAScript 2015+ Map to an Object.create(null) type of Hash-Map.
/** @type {Object.<string, number>} */
const hashMap = utils.convertMapToRecordHashMap(textMap)
console.log(hashMap)
// > { chuck: 5, woodchuck: 4, wood: 4 }
```
