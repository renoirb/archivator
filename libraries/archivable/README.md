# [@archivator/archivable][repo-url] (private package)

> Archivable Data Transfer Object

A _Data Transfer Object_ (or _Entity_ object) and related utilities to manipulate Web Page Metadata while archiving.

[repo-url]: https://github.com/renoirb/archivator/blob/re-rework/libraries/archivable 'Archivable Data Transfer Object'

## Usage

### Archivable

Using Constructor

```js
import { Archivable } from '@archivator/archivable'

// HTML Source document URL from where the asset is embedded
// Ignore document origin if resource has full URL, protocol relative, non TLS
const sourceDocument =
  'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510'

const selector = '#main'
const truncate = '.ad,.sponsor'

/** @type {import('@archivator/archivable').ArchivableType} */
const dto = new Archivable(sourceDocument, selector, truncate)
// ... Do things with `dto`
```

When using CSV format

```js
import { Archivable } from '@archivator/archivable'

// The following lines would be from a text file where we have one item per line
// Each item MUST have two semi-columns
const lines = [
  'http://example.org/@ausername/some-lengthy-string-ending-with-a-hash-1a2d8a61510;#main;.ad,.sponsor',
]

for (const line of lines) {
  /** @type {import('@archivator/archivable').ArchivableType} */
  const dto = Archivable.fromLine(line)
  // ... Do things with `dto`
}
```
