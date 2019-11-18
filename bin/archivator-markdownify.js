import {
    catcher,
    iterateIntoArchivable
} from '../src/module';
import {
read,
handle,
write
} from '../src/markdownify';

const URL_LIST = 'archive/index.csv';

(async () => {
/**
 * Something is going somewhat as an anti-pattern here.
 * We want Promise.all(...) at each step, and it's not how
 * it is as of now. Needs rework here. TODO
 */
  for (const archivable of iterateIntoArchivable(URL_LIST)) {
    const contents = await read(archivable).catch(catcher);
    const handled = await handle(contents).catch(catcher);
    await write(handled).catch(catcher);
  }
})();
