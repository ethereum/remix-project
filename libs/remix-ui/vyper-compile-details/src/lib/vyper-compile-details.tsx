import React from 'react'
import VyperCompile from './vyperCompile'
import { ThemeKeys, ThemeObject } from '@microlink/react-json-view'

interface RemixUiVyperCompileDetailsProps {
  payload: any
  theme?: ThemeKeys | ThemeObject
  themeStyle?: any
}

export function RemixUiVyperCompileDetails({ payload, theme, themeStyle }: RemixUiVyperCompileDetailsProps) {
  const compileResult = payload['compileResult'] ?? {}
  const bcode = compileResult.bytecode ? compileResult.bytecode.object : ''
  const runtimeBcode = compileResult.runtimeBytecode ? compileResult.runtimeBytecode.object : ''
  const ir = compileResult.ir
  const methodIdentifiers= compileResult.methodIdentifiers
  const abi= compileResult.abi
  const compilerVersion = compileResult?.version ?? ''
  const emvVersion = compileResult?.evmVersion ?? ''

  return (
    <>
      <VyperCompile
        result={{ bytecode: bcode, bytecodeRuntime: runtimeBcode, ir: ir, methodIdentifiers: methodIdentifiers, abi: abi, compilerVersion: compilerVersion, evmVersion: emvVersion }}
        theme={theme}
        themeStyle={themeStyle}
      />
    </>
  )
}
