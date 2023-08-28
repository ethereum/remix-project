/* eslint-disable no-use-before-define */
import React from 'react'

import { SolidityCompiler } from '@remix-ui/solidity-compiler' // eslint-disable-line

import { CompilerClientApi } from './compiler'

const remix = new CompilerClientApi()

export const App = () => {
  return (
    <div>
      <SolidityCompiler api={remix} />
    </div>
  )
}

export default App
