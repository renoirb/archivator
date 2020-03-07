# [@archivator/text-processing-normalizer][repo-url] (private package)

> Archivable Data Transfer Object

A _Data Transfer Object_ (or _Entity_ object) and related utilities to manipulate Web Page Metadata while archiving.

[repo-url]: https://github.com/renoirb/archivator/blob/v3.x-dev/libraries/archivable 'Archivable Data Transfer Object'

## Usage

### TextProcessingNormalizer

```js
import TextProcessingNormalizer from '@archivator/text-processing-normalizer'

const sourceDocumentText = `
During a work session on my salt-states for WebPlatform.org I wanted to shape be able to query the OpenStack cluster meta-data so that I can adjust more efficiently my salt configuration.
What are grains? Grains are structured data that describes what a minion has such as which version of GNU/Linux its running, what are the network adapters, etc.
The following is a Python script that adds data in Salt Stack&#x2019; internal database called grains.
`

/**
 * Stop Words are words that are mostly noise when we try to analyze what it is about
 * They're different for each language.
 *
 * What we want is to count word usage. For this purpose, a "word" are letters and numbers in sequence.
 * Notice in stopWords, we're not adding 'that', it is present 3 times in the text above.
 */
const stopWords = ['to', 'able', 'in']
const normalizer = new TextProcessingNormalizer(stopWords)
normalizer.setText(sourceDocumentText)
```
