import { normalizer } from '..'

describe('pathName', () => {
  test('Happy-Path', () => {
    /**
     * Normalizing from URL http://www.example.org/fOo/Bar/bAAz.html
     * taking "/fOo/Bar/bAAz.html" into "/foo/bar/baaz"
     */
    const example = 'http://www.example.org/fOo/Bar/bAAz.html'
    const subject = normalizer.pathName(example)
    expect(subject).toBe('/foo/bar/baaz')
  })
})

describe('searchParams', () => {
  test('Happy-Path', () => {
    /**
     * Get path '/bar/bazz/zulu/please' as consistently sorted
     * out of free-form 'http://example.org/foo?zulu=please&bar=bazz&buzz'
     */
    const example = 'http://example.org/foo?zulu=please&bar=bazz&buzz'
    const subject = normalizer.searchParams(example)
    console.log('searchParams', { example, subject })
    expect(subject).toBe('/bar/bazz/zulu/please')
  })
})

describe('toUrl', () => {
  test('Happy-Path', () => {
    const subject = normalizer.toUrl('http://localhost/foo?bar&buzz=yes')
    expect(subject).toMatchSnapshot()
    expect(subject).toHaveProperty('searchParams')
    expect(subject).toHaveProperty('host', 'localhost')
    expect(subject).toHaveProperty('hostname', 'localhost')
    expect(subject).toHaveProperty('pathname', '/foo')
    expect(subject).toHaveProperty('search', '?bar&buzz=yes')
  })

  test('Exceptions', () => {
    expect(() => normalizer.toUrl('ლ(́◉◞౪◟◉‵ლ)')).toThrow(
      'Invalid URL: ლ(́◉◞౪◟◉‵ლ)',
    )
  })
})
