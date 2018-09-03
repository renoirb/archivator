import {URL} from 'url';

import normalilzeUrlSlug from './normalizer/slugs';
import {cheerioLoad, urlNotInBlacklist} from './common';
import extractAssets from './assets-handler';

function simplifyBody(truncate, selector, body) {
  return cheerioLoad(body).then(shard => {
    shard(truncate).remove();
    return shard(selector);
  });
}

async function extractLinks(body) {
  const links = new Set();
  return cheerioLoad(body).then(shard => {
    shard('a[href]').each((_, element) => {
      const href = shard(element).attr('href');
      try {
        const hrefObj = new URL(href);
        const isHttpLink = hrefObj.protocol.startsWith('http');
        if (isHttpLink) {
          const rewritten = `${hrefObj.origin}${hrefObj.pathname}`;
          if (urlNotInBlacklist(rewritten)) {
            links.add(rewritten);
          }
        }
      } catch (err) { }
    });
    return [...links];
  });
}

function appendDefaultTruncate(truncateArg) {
  // Truncate is to strip off any patterns we do not want
  // as part of our archived article.
  let truncate = (truncateArg.length === 0) ? '' : `${truncateArg},`;
  truncate += 'script,style,noscript';
  return truncate;
}

function appendDefaultSelector(selectorArg) {
  // If we know exactly where the main content is, otherwise grab the whole
  // document body.
  return (selectorArg.length === 0) ? 'body' : `${selectorArg}`;
}

/**
 * Given every row in source file .csv
 * http://example.org/a/b.html;selector;truncate
 *
 * selector is the CSS selector where the main content is
 * truncate is a list of CSS selectors to strip off
 */
class Archivable {
  constructor(
    url,
    truncate = '',
    selector = '',
  ) {
    if (typeof url === 'undefined') {
      const message = `First argument is URL, and is Required`;
      throw new Error(message);
    }
    this.url = url;
    this.slug = normalilzeUrlSlug(url);
    this.truncate = truncate;
    this.selector = selector;
    this.assets = [];
    this.links = [];
    this.body = '';
  }

  async setBody(body) {
    const truncate = this.truncate;
    const selector = this.selector;
    const simplified = await simplifyBody(truncate, selector, body);
    const html = simplified.html();
    this.body = html;
    const links = await extractLinks(html);
    this.links = [...links];
    const assets = await extractAssets(this);
    this.assets = [...assets];
  }

  toJSON() {
    const url = this.url;
    const slug = this.slug;
    const truncate = this.truncate;
    const selector = this.selector;
    const assets = [...this.assets];
    const links = [...this.links];

    return {
      url,
      slug,
      truncate,
      selector,
      assets,
      links
    };
  }

  static fromJSON(arg) {
    const argIsString = typeof arg === 'string';
    if (argIsString === false) {
      const message = 'Only String is supported';
      throw new Error(message);
    }
    const {
      url,
      truncate,
      selector
    } = JSON.parse(arg);

    return new Archivable(url, truncate, selector);
  }

  static fromLine(
      line = 'http://localhost;;',
  ) {
    const [url, selectorArg = '', truncateArg = ''] = line.split(';');
    const truncate = appendDefaultTruncate(truncateArg);
    const selector = appendDefaultSelector(selectorArg);

    return new Archivable(url, truncate, selector);
  }
}

export default Archivable;
