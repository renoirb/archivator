export function urlToName(someUrl) {
  return String(someUrl)
          .replace(/^https/, 'http')
          .replace(/^http:\/\/(.*)/, '$1')
          .replace(/(@|www\.)/g, '')
          .replace(/\/$/, '');
}

export function * prepareList(urls) {
  for (const url of urls) {
    const name = urlToName(url[0]);
    yield {name, selector: url[1], url: url[0]};
  }
}
