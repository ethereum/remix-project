import React, { useState, useEffect } from 'react'

import { SolidityCompiler } from '@remix-ui/solidity-compiler' // eslint-disable-line

import { CompilerClientApi } from './compiler'

const remix = new CompilerClientApi()

export const App = () => {
  return (
<<<<<<< HEAD
    <div>
=======
    <div className="debugger">
>>>>>>> dd38f71d3 (refactor ICompilerAPI)
      <SolidityCompiler api={remix} />
    </div>
  )
}

export default App
