'use strict'
import tape from 'tape'
import { getValidLanguage } from '../src/compiler/compiler-input'
import { Language } from '../src/compiler/types'

tape('compiler-input', function (t) {
  t.test('getValidLanguage', function (st) {
    st.plan(9)

    const correctYul: Language = 'Yul'
    const correctSolidity: Language = 'Solidity'

    const yulUpperCase = 'Yul'
    const yulLowerCase = 'yul'

    const solidityUpperCase = 'Solidity'
    const solidityLowerCase = 'solidity'

    st.equal(getValidLanguage(yulLowerCase), correctYul)
    st.equal(getValidLanguage(yulUpperCase), correctYul)
    st.equal(getValidLanguage(solidityUpperCase), correctSolidity)
    st.equal(getValidLanguage(solidityLowerCase), correctSolidity)
    st.equal(getValidLanguage(null), null)
    st.equal(getValidLanguage(undefined), null)
    st.equal(getValidLanguage(''), null)
    st.equal(getValidLanguage('A'), null)
    st.equal(getValidLanguage('Something'), null)
  })
})
