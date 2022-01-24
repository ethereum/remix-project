import { getValidLanguage } from '../src/compiler/compiler-input'
import { Language } from '../src/compiler/types'

describe('compiler-input', () => {
  test('getValidLanguage', () => {
    const correctYul: Language = 'Yul'
    const correctSolidity: Language = 'Solidity'

    const yulUpperCase = 'Yul'
    const yulLowerCase = 'yul'

    const solidityUpperCase = 'Solidity'
    const solidityLowerCase = 'solidity'

    expect(getValidLanguage(yulLowerCase)).toBe(correctYul)
    expect(getValidLanguage(yulUpperCase)).toBe(correctYul)
    expect(getValidLanguage(solidityUpperCase)).toBe(correctSolidity)
    expect(getValidLanguage(solidityLowerCase)).toBe(correctSolidity)
    expect(getValidLanguage(null)).toBe(null)
    expect(getValidLanguage(undefined)).toBe(null)
    expect(getValidLanguage('')).toBe(null)
    expect(getValidLanguage('A')).toBe(null)
    expect(getValidLanguage('Something')).toBe(null)    
  })
})
