/**
 * The following is to allow using URL in TypeScript
 * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34960
 *
 * No need to expose in typings, what is here should be taken into account
 * when we import that library.
 */
declare global {
  const URL: typeof globalThis extends {
    Document: new () => { querySelectorAll: any }
    URL: infer URLCtor
  }
    ? URLCtor
    : typeof import('url').URL
}

declare module 'resources/fixtures/slugification.json' {
  export type UrlsExpectedExplanationTuples = [string, string, string][]
}
