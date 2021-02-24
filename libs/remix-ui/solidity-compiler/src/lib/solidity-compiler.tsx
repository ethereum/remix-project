import React, { useState } from 'react' // eslint-disable-line
import { SolidityCompilerProps } from './types'

import './css/solidity-compiler.css'

export const RemixUiSolidityCompiler = (props: SolidityCompilerProps) => {
  const { editor, config, fileProvider, fileManager, contentImport, queryParams, plugin } = props
  const [state, setState] = useState({
    contractsDetails: {}
    eventHandlers: {},
    loading: false
  })

  const clearAnnotations = () => {
    plugin.call('editor', 'clearAnnotations')
  }

  return (
    <div>
    </div>
  )
}

export default RemixUiSolidityCompiler
