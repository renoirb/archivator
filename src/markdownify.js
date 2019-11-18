'use strict';

import * as fsa from 'async-file';
import htmlmd from 'html-md-2';

import {
  readFileWithErrorHandling,
  iterateIntoArchivable,
  catcher,
  cheerioLoad
} from './common';

const cheerioConfig = {normalizeWhitespace: true, xmlMode: false, decodeEntities: true};

const URL_LIST = 'archive/index.csv';
const OVERWRITE = true;

async function markdownify(descriptor) {
  const publicPrefix = '/wp-content/uploads/';
  const {cache = '', assets, archivable = {}} = descriptor || {};
  return cheerioLoad(cache, cheerioConfig)
          .then(shard => {
              /**
               * Each references dictionary should look like this;
               * ```
               * { 'http://example.org/a.png': '6c65613db26a19d838c0359989f941c303c04474.png',
               *   'http://example.org/a.webm': '5c737acd98c723bbed666bbfb3d14a8e0d34266b.webm' }
               * ```
               */
            const references = Object.create(null);
            (assets.assets || []).forEach(ref => {
              references[ref.match] = ref.name;
            });
            return {references, shard};
          })
          .then(({references, shard}) => {
            shard('img[src]').each((_, element) => {
                  /**
                   * What we receive looks like this;
                   * ```
                   * { '_': 0,
                   *   'element':
                   *    { type: 'tag',
                   *      name: 'img',
                   *      attribs:
                   *       { src: 'http://example.org/a.png',
                   *         alt: 'A Image Alt text',
                   *         class: 'example img class-name list' },
                   *      children: [],
                   *      next: null,
                   *      prev: {},
                   *      parent: {} } }
                   * ```
                   */
              shard(element).attr('class', null);
              const src = shard(element).attr('src');
                  /**
                   * Assuming our references object (see above) has a key
                   * (e.g. http://example.org/a.png) with a matching
                   * value (e.g. 6c65613db26a19d838c0359989f941c303c04474.png)
                   * we replace the img[src] value with it.
                   * That way, our Markdownified file will refer to archived
                   * assets beside it instead of ones from source origin.
                   */
              const newSrc = (typeof references[src] === 'string') ? references[src] : src + '?err=CouldNotFind';
              shard(element).attr('src', publicPrefix + newSrc);
            });

            return shard;
          })
          .then(shard => {
            let title = shard('title').text();
            title = title.replace(' – Renoir Boulanger', '');
            let date = '';
            const matched = shard('.entry-meta .posted-on [datetime]').map((_, e) => shard(e).attr('datetime'));
            const categories = shard('.cat-tags-links .cat-links a').map((_, e) => `"${shard(e).text()}"`).toArray();
            const tags = shard('.cat-tags-links .tags-links a').map((_, e) => `"${shard(e).text()}"`).toArray();
            const entryTitle = shard('h1.entry-title').text();
            if (entryTitle && String(title).length > 1) {
              if (entryTitle === title) {
                shard('h1.entry-title').remove();
              }
            }
            if (matched) {
              const dates = matched.toArray();
              if (dates.length > 0) {
                date = dates[0];
                shard('.entry-meta').remove();
              }
            }
            shard(archivable.truncate).remove();
            shard('.entry-footer').remove()
            const body = shard(archivable.selector).html();
            const frontMatter = {title, categories: `[${categories.join(',')}]`, tags: `[${tags.join(',')}]`};
            if (date !== '') {
              frontMatter.date = date
            }
            return {meta: frontMatter, body};
          })
          .then(simplified => {
            const dto = [];
            const meta = simplified.meta;
            for (const key in meta) {
              if (Object.prototype.hasOwnProperty.call(meta, key)) {
                let value = `${meta[key]}`;
                if (value.includes(':')) {
                  value = `"${value}"`;
                }
                dto.push(`${key}: ${value}`);
              }
            }
            const top = dto.join(`\n`);
            const bottom = htmlmd(simplified.body);

            return `${top}\n---\n\n${bottom}\n`;
          });
}

async function handle(descriptor) {
  const {file, archivable, analyze = {}} = descriptor;
  const {name, exists = false, overwrite = false} = file;
  let canonicalFileName = file.name.replace('/index.md', '.md')
  
  var tuple = canonicalFileName.split('/').map(Number).filter(Number.isInteger)
  const month = String(tuple[1]).padStart(2, '0')
  canonicalFileName = canonicalFileName.replace(/\/([\w\d\-\_]+)\.md$/, `/${tuple[0]}-${month}-`+'$1.md')

  const out = {
    fileName: name,
    canonicalFileName,
    contents: ''
  };

  if (
    (exists === false) ||
    (exists === true && overwrite === true)
  ) {
    let contents = '---\n';
    if (Object.prototype.hasOwnProperty.call(analyze || {}, 'keywords')) {
      const keywords = Object.keys(analyze.keywords).map(i => `"${i}"`);
      contents += `keywords: [${keywords}]\n`;
    }
    contents += `canonical: "${archivable.url}"\n`;
    contents += await markdownify(descriptor);
    out.contents = contents;
  }

  // console.log('handle(descriptor) => ', {fileName: name, contents: '...'});

  return out;
}

/**
 *
 * Return object signature:
 *
 * ```ts
 * interface ReadDataOutput {
 *   archivable: Archivable
 *   cache: string
 *   assets: {
 *     source: {
 *       url: string
 *       slug: string
 *       selector: string
 *       truncate: string
 *     }
 *     assets: [{}]
 *     links: {}
 *   }
 *   analyze: {
 *     words: { [word: string]: number }
 *   }
 *   file: {
 *     exists: boolean
 *     name: string
 *     overwrite: boolean
 *   }
 * }
 * ```
 */
async function read(archivable, overwriteOption) {
  // console.log('read(archivable) ', { archivable, overwriteOption } )
  const path = `archive/${archivable.slug}`;
  const data = Object.create(null);
  data.archivable = archivable;
  const cacheFile = `${path}/document.html`;
  const cacheExists = await fsa.exists(cacheFile);
  if (cacheExists) {
    data.cache = await readFileWithErrorHandling(cacheFile);
  }
  const assetsFile = `${path}/assets.json`;
  const assetsExists = await fsa.exists(assetsFile);
  if (assetsExists) {
    const assetsFileContents = await readFileWithErrorHandling(assetsFile);
    data.assets = JSON.parse(assetsFileContents);
  }
  const analyzeFile = `${path}/analyze.json`;
  const analyzeExists = await fsa.exists(analyzeFile);
  if (analyzeExists) {
    const analyzeFileContents = await readFileWithErrorHandling(analyzeFile);
    data.analyze = JSON.parse(analyzeFileContents);
  }
  const targetFileName = `${path}/index.md`;
  const markdownifiedExists = await fsa.exists(targetFileName);
  data.file = {exists: markdownifiedExists, name: targetFileName, overwrite: overwriteOption};

  console.log(`Markdownifying ${data.file.name}`);

  return data;
}

async function write(opts, boolOverwrite = false) {
  const { fileName, contents = ''} = opts
  const destExists = await fsa.exists(fileName);
  // const truncatedContents = contents.substr(0, 1000) + '\n...(truncated)...\n';
  // console.log('write({fileName, contents}, boolOverwrite)', {fileName, contents: truncatedContents, destExists, boolOverwrite});
  if (destExists === false || (destExists === true && boolOverwrite)) {
    await fsa.writeTextFile(fileName, contents, 'utf8');
  }
  if (opts && opts.canonicalFileName) {
    await fsa.writeTextFile(opts.canonicalFileName, contents, 'utf8');
  }

  return {fileName, contents};
}

(async () => {
  /**
   * Something is going somewhat as an anti-pattern here.
   * We want Promise.all(...) at each step, and it's not how
   * it is as of now. Needs rework here. TODO
   */
  for (const url of iterateIntoArchivable(URL_LIST)) {
    const readDataOutputObj = await read(url, OVERWRITE).catch(catcher);
    const fileNameAndContents = await handle(readDataOutputObj).catch(catcher);
    await write(fileNameAndContents, OVERWRITE).catch(catcher);
  }
})();
