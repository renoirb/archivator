/**
 * Word Usage Count.
 *
 * First item is the word, second item is its count.
 *
 * @public
 */
export type WordUsageMapType = Map<string, number>

/**
 * All words found on a document, one word per item.
 * May or may not have duplicates.
 *
 * @public
 */
export type WordsType = ReadonlyArray<string>

export type NonStopWordIsserType = (word: string) => boolean

export type WordNormalizerType = (word: any) => string | void

/**
 * What are the sorted words and the top keywords found after analysis.
 */
export interface SortedKeywordsRecordType {
  sorted: Map<string, number>
  keywords: string[]
}

/**
 * Utility Type.
 *
 * When we want to convert a Record hash-map into an ECMAScript2015 Map.
 */
export type RecordToMapFactoryType<T = string | number, U = string | number> = (
  input: Record<T, U>,
) => Map<T, U>

/**
 * Coroutine Generator Sink.
 *
 * Bookmarks:
 * - https://twitter.com/renoirb/status/1236386606266953731
 * - https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/co/index.d.ts
 * - https://gist.github.com/OrionNebula/bd2d4339497a2c05e599d7d24038d290
 * - https://github.com/wowts/coroutine
 */
// export type CoroutineGeneratorSink<T> = Generator<T, symbol, T>
