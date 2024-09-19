import React, { Fragment, useEffect, useState } from 'react'
import { isVyper, compile, toStandardOutput, isCompilationError, remixClient, normalizeContractPath, compileContract, RemixClient } from '../utils'
import Button from 'react-bootstrap/Button'

interface Props {
  compilerUrl: string
  contract?: string
  output?: any
  setOutput: (name: string, output: any) => void
  resetCompilerState: () => void
  remixClient: RemixClient
}

function CompilerButton({ contract, setOutput, compilerUrl, resetCompilerState, output, remixClient }: Props) {
  const [loadingSpinner, setLoadingSpinnerState] = useState(false)

  if (!contract || !contract) {
    return <Button disabled className="w-100">No contract selected</Button>
  }

  if (!isVyper(contract)) {
    return <Button disabled className="w-100">Not a vyper contract</Button>
  }

  /** Compile a Contract */

  return (
    <Fragment>
      <button data-id="compile"
        onClick={async () => {
          setLoadingSpinnerState(true)
          await compileContract(contract, compilerUrl, setOutput, setLoadingSpinnerState)
        }}
        className="btn btn-primary w-100 d-block btn-block text-break remixui_disabled mb-1 mt-3"
      >
        <div className="d-flex align-items-center justify-content-center fa-1x">
          <span className={ loadingSpinner ? 'fas fa-sync fa-pulse mr-1' : 'fas fa-sync mr-1'} />
          <div className="text-truncate overflow-hidden text-nowrap">
            <span>Compile</span>
            <span className="ml-1 text-nowrap">{contract}</span>
          </div>
        </div>
      </button>
    </Fragment>
  )
}

export default CompilerButton
