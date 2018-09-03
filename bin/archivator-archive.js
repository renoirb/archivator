import {
  catcher,
  fetcher,
  transformer,
  analyzer,
  iterateIntoArchivable
} from '../src/module';

const URL_LIST = 'archive/index.csv';

(async () => {
  /**
   * Something is going somewhat as an anti-pattern here.
   * We want Promise.all(...) at each step, and it's not how
   * it is as of now. Needs rework here. TODO
   */
  for (const archivable of iterateIntoArchivable(URL_LIST)) {
    await fetcher(archivable).catch(catcher);
    await transformer(archivable).catch(catcher);
    await analyzer(archivable).catch(catcher);
  }
})();
