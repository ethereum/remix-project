import React from 'react'

export const fileChangedToastMsg = (from: string, path: string) => (
  <div><i className="fas fa-exclamation-triangle text-danger mr-1"></i>
    <span>
      {from} <span className="font-weight-bold text-warning">
        is modifying 
      </span> {path}
    </span>
  </div>
)

export const compilerConfigChangedToastMsg = (from: string, value: string) => (
  <div>
    <b>{ from }</b> is updating the <b>Solidity compiler configuration</b>.
    <pre className="text-left">{value}</pre>
  </div>
)

export const compileToastMsg = (from: string, fileName: string) => (
  <div>
    <b>{from}</b> is requiring to compile <b>{fileName}</b>
  </div>
)

export const compilingToastMsg = (settings: string) => (
  <div>
    <b>Recompiling and debugging with params</b>
    <pre className="text-left">{settings}</pre></div>
)

export const compilationFinishedToastMsg = () => (
  <div>
    <b>Compilation failed...</b> continuing <i>without</i> source code debugging.
  </div>
)

export const notFoundToastMsg = (address: string) => (
  <div>
    <b>Contract {address} not found in source code repository</b> continuing <i>without</i> source code debugging.
  </div>
)

export const localCompilationToastMsg = () => (
  <div>
    <b>Using compilation result from Solidity module</b>
  </div>
)

export const sourceVerificationNotAvailableToastMsg = () => (
  <div>
    <b>Source verification plugin not activated or not available.</b> continuing <i>without</i> source code debugging.
  </div>
)
