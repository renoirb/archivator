<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@archivator/content-divinator](./content-divinator.md) &gt; [ContentDivinator](./content-divinator.contentdivinator.md)

## ContentDivinator class

Attempt at guessing stuff, summarize content, based on raw text.

This is the entry-point to other utilities. Instance of this class should contain contextual configuration such as the stop-words, and locales.

Methods should return immutable copies of the instance’s configuration.

<b>Signature:</b>

```typescript
export declare class ContentDivinator
```

## Constructors

| Constructor                                                                                | Modifiers | Description                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [(constructor)(stopWords, locales)](./content-divinator.contentdivinator._constructor_.md) |           | Create a ContentDivinator instance.[String.prototype.toLocaleLowerCase](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase) |

## Methods

| Method                                                                          | Modifiers           | Description                                                                                            |
| ------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| [factory(predefined, locales)](./content-divinator.contentdivinator.factory.md) | <code>static</code> | Create a preconfigured ContentDivinator based on statically stored files.                              |
| [words(text)](./content-divinator.contentdivinator.words.md)                    |                     | Extract words from the following text.<!-- -->If special symbols are found, they will be stripped off. |