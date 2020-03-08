/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { RecordToMapFactoryType } from './types'

/**
 * Sorting closure.
 *
 * Assuming each value are some sort of count.
 * We want the biggest number first.
 *
 * When matching Array from following signature
 *
 * The following should match an array of type `Array<[string, number]>`
 *
 * Here is copy-pasta from VSCode for compare function.
 *
 * ```
 * Array<[string, number]>.sort(compareFn?: ((a: [string, number], b: [string, number]) => number) | undefined): [string, number][]
 * ```
 *
 * There must be a way to extract `compareFn` argument type using TypeScript’s utility types.
 * I haven't figured it out yet.
 *
 */
const whenValuesAreNumbersFromBiggestToLowest = (
  a: [string, number],
  b: [string, number],
): number => -1 * (a[1] - b[1])

export const sorting = {
  whenValuesAreNumbersFromBiggestToLowest,
}

export const convertRecordHashMapToMap: RecordToMapFactoryType<
  string,
  number
> = input => {
  const map = new Map<string, number>(Object.entries(input))

  const out = new Map<string, number>(
    [...map.entries()].sort(sorting.whenValuesAreNumbersFromBiggestToLowest),
  )

  return out
}
