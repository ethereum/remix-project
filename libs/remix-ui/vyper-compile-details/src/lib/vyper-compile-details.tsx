import React from 'react'
import VyperCompile from './vyperCompile'
//@ts-nocheck


interface RemixUiVyperCompileDetailsProps {
  payload: any
}

export function RemixUiVyperCompileDetails({ payload }: RemixUiVyperCompileDetailsProps) {
  const dpayload = Object.values(payload) as any

  return (
    <>
      <VyperCompile
        ir={dpayload[0].ir}
        methodIdentifiers={dpayload[0].methodIdentifiers}
        abi={dpayload[0].abi}
        bytecode={dpayload[0].bytecode}
        bytecodeRuntime={dpayload[0].bytecodeRuntime}
      />
    </>
  )
}
