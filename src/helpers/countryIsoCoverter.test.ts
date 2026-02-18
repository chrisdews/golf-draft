import countryIsoConverter from './countryIsoCoverter'

describe('countryIsoConverter', () => {
  it('converts standard 3-letter ISO codes to 2-letter codes', () => {
    expect(countryIsoConverter('USA')).toBe('US')
    expect(countryIsoConverter('GBR')).toBe('GB')
    expect(countryIsoConverter('AUS')).toBe('AU')
    expect(countryIsoConverter('IRL')).toBe('IE')
    expect(countryIsoConverter('ZAF')).toBe('ZA')
  })

  it('handles golf-specific sub-country codes for flag display', () => {
    expect(countryIsoConverter('ENG')).toBe('GB-eng')
    expect(countryIsoConverter('SCO')).toBe('GB-sct')
    expect(countryIsoConverter('NIR')).toBe('GB-nir')
  })

  it('returns undefined for unknown codes', () => {
    expect(countryIsoConverter('ZZZ')).toBeUndefined()
    expect(countryIsoConverter('')).toBeUndefined()
    expect(countryIsoConverter('XXX')).toBeUndefined()
  })

  it('is case-sensitive (codes must be uppercase)', () => {
    expect(countryIsoConverter('usa')).toBeUndefined()
    expect(countryIsoConverter('Usa')).toBeUndefined()
  })
})
