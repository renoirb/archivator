# [@archivator/content-divinator][repo-url]

> Attempt at guessing stuff, summarize content, based on raw text. A naïve Natural Language Processing toolkit.

This is, by no means, an actual attempt at Machine Learning.
It’s simply a few helpers to help automate maintenance of metadata from imported content.

[repo-url]: https://github.com/renoirb/archivator/blob/v3.x-dev/libraries/content-divinator 'Content Divinator'

## Usage

_See also_:

- [API Extractor code-review signature](../../common/reviews/api/content-divinator.api.md)
- [API Documentor generated docs](./docs/index.md)

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

## Bookmarks

### Refactor into coroutine?

During March 5th refactor work session, [I’ve attempted in making use of coroutine][coroutine-gist].
But I’ve dropped the idea when my [favourite JavaScript author said _he hasn’t seen strongly typed usage of coroutine_][renoir-axel-tweets].

[renoir-axel-tweets]: https://twitter.com/renoirb/status/1236386606266953731
[coroutine-gist]: https://gist.github.com/renoirb/e7d344cb88524800c247c6842e4eb550

- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/co/index.d.ts
- https://gist.github.com/OrionNebula/bd2d4339497a2c05e599d7d24038d290
- https://github.com/danoctavian/node-coroutine-utils
- https://github.com/wowts/coroutine
- http://calculist.org/blog/2011/12/14/why-coroutines-wont-work-on-the-web/
- https://www.bennadel.com/blog/3264-thoughts-on-defining-coroutines-as-class-methods-in-node-js-and-typescript.htm
