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
 * @package sorting
 */
const whenRecordValueIsNumberOrderByDescending = (
  a: [string, number],
  b: [string, number],
): number => -1 * (a[1] - b[1])

export const sorting = {
  whenRecordValueIsNumberOrderByDescending,
}
