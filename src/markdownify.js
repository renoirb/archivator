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
  const html = descriptor.cache;
  const assets = descriptor.assets.assets;
  const source = descriptor.source;
  return cheerioLoad(html, cheerioConfig)
          .then(shard => {
              /**
               * Each references dictionary should look like this;
               * ```
               * { 'http://example.org/a.png': '6c65613db26a19d838c0359989f941c303c04474.png',
               *   'http://example.org/a.webm': '5c737acd98c723bbed666bbfb3d14a8e0d34266b.webm' }
               * ```
               */
            const references = Object.create(null);
            assets.forEach(ref => {
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
              shard(element).attr('src', newSrc);
            });

            return shard;
          })
          .then(shard => {
            const {selector, truncate} = source.figureOutTruncateAndSelector();
            const title = shard('title').text();
            shard(truncate).remove();
            const body = shard(selector).html();
            const frontMatter = {title};

            return {meta: frontMatter, body};
          })
          .then(simplified => {
            const dto = [];
            const meta = simplified.meta;
            for (const key in meta) {
              if (Object.prototype.hasOwnProperty.call(meta, key)) {
                dto.push(`${key}: "${meta[key]}"`);
              }
            }
            const top = dto.join(`\n`);
            const bottom = htmlmd(simplified.body);

            return `${top}\n\n---\n\n${bottom}\n`;
          });
}

async function handle(descriptor) {
  const file = descriptor.file.name;
  if (
    (descriptor.file.exists === false) ||
    (descriptor.file.exists === true && descriptor.file.overwrite === true)
  ) {
    const source = descriptor.source;
    let contents = '';
    if (Object.prototype.hasOwnProperty.call(descriptor.analyze || {}, 'keywords')) {
      const keywords = Object.keys(descriptor.analyze.keywords);
      contents += `keywords: [${keywords}]\n`;
    }
    contents += `url: "${source.url}"\n`;
    const markdownified = await markdownify(descriptor);
    contents += markdownified;
    return {
      file,
      contents
    };
  }
}

async function read(source, overwriteOption) {
  const path = `archive/${source.slug}`;
  const data = Object.create(null);
  data.source = source;
  const cacheFile = `${path}/cache.html`;
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

async function write({file, contents}, boolOverwrite = false) {
  const destExists = await fsa.exists(file);
  if (destExists === false || (destExists === true && boolOverwrite)) {
    await fsa.writeTextFile(file, contents, 'utf8');
  }

  return {file, contents};
}

/**
 * Something is going somewhat as an anti-pattern here.
 * We want Promise.all(...) at each step, and it's not how
 * it is as of now. Needs rework here. TODO
 */
for (const url of iterateIntoArchivable(URL_LIST)) {
  Promise.resolve(url)
    .then(u => read(u, OVERWRITE))
    .then(descriptor => handle(descriptor))
    .then(descriptor => write(descriptor, OVERWRITE))
    .catch(catcher);
}
