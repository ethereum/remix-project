import { getValidLanguage } from '../src/compiler/compiler-input'
import { Language } from '../src/compiler/types'
//@ts-ignore
describe('compiler-input', () => {
  //@ts-ignore
  test('getValidLanguage', () => {
    const correctYul: Language = 'Yul'
    const correctSolidity: Language = 'Solidity'

    const yulUpperCase = 'Yul'
    const yulLowerCase = 'yul'

    const solidityUpperCase = 'Solidity'
    const solidityLowerCase = 'solidity'
    //@ts-ignore
    expect(getValidLanguage(yulLowerCase)).toBe(correctYul)
    //@ts-ignore
    expect(getValidLanguage(yulUpperCase)).toBe(correctYul)
    //@ts-ignore
    expect(getValidLanguage(solidityUpperCase)).toBe(correctSolidity)
    //@ts-ignore
    expect(getValidLanguage(solidityLowerCase)).toBe(correctSolidity)
    //@ts-ignore
    expect(getValidLanguage(null)).toBe(null)
    //@ts-ignore
    expect(getValidLanguage(undefined)).toBe(null)
    //@ts-ignore
    expect(getValidLanguage('')).toBe(null)
    //@ts-ignore
    expect(getValidLanguage('A')).toBe(null)
    //@ts-ignore
    expect(getValidLanguage('Something')).toBe(null)
  })
})
