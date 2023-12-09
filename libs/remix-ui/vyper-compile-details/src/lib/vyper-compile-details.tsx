import React from 'react'
import VyperCompile from './vyperCompile'
import { ThemeKeys, ThemeObject } from '@microlink/react-json-view'


interface RemixUiVyperCompileDetailsProps {
  payload: any
  theme?: ThemeKeys | ThemeObject
  themeStyle?: any
}

export function RemixUiVyperCompileDetails({ payload, theme, themeStyle }: RemixUiVyperCompileDetailsProps) {
  const dpayload = Object.values(payload) as any ?? {}
  const bcode = dpayload[0].bytecode ? dpayload[0].bytecode.object : ''
  const runtimeBcode = dpayload[0].runtimeBytecode ? dpayload[0].runtimeBytecode.object : ''
  const ir = dpayload[0].ir
  const methodIdentifiers= dpayload[0].methodIdentifiers
  const abi= dpayload[0].abi
  return (
    <>
      <VyperCompile
        result={{bytecode: bcode, bytecodeRuntime: runtimeBcode, ir: ir, methodIdentifiers: methodIdentifiers, abi: abi}}
        theme={theme}
        themeStyle={themeStyle}
      />
    </>
  )
}
