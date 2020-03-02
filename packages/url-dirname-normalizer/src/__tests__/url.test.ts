import { toUrl } from '../internal'

describe('toUrl', () => {
  test('Happy-Path', () => {
    const subject = toUrl('http://localhost/foo?bar&buzz=yes')
    expect(subject).toMatchSnapshot()
    expect(subject).toHaveProperty('searchParams')
    expect(subject).toHaveProperty('host', 'localhost')
    expect(subject).toHaveProperty('hostname', 'localhost')
    expect(subject).toHaveProperty('pathname', '/foo')
    expect(subject).toHaveProperty('search', '?bar&buzz=yes')
  })

  test('Exceptions', () => {
    expect(() => toUrl('ლ(́◉◞౪◟◉‵ლ)')).toThrow('Invalid URL: ლ(́◉◞౪◟◉‵ლ)')
  })
})
