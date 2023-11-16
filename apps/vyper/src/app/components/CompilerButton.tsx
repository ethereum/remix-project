import React from 'react'
import {isVyper, compile, toStandardOutput, VyperCompilationOutput, isCompilationError, remixClient, normalizeContractPath} from '../utils'
import Button from 'react-bootstrap/Button'
import _ from 'lodash'
import { runtime } from 'webpack'

interface Props {
  compilerUrl: string
  contract?: string
  setOutput: (name: string, output: any) => void
  resetCompilerState: () => void
}

function CompilerButton({contract, setOutput, compilerUrl, resetCompilerState}: Props) {
  if (!contract || !contract) {
    return <Button disabled>No contract selected</Button>
  }

  if (!isVyper(contract)) {
    return <Button disabled>Not a vyper contract</Button>
  }

  /** Compile a Contract */
  async function compileContract() {
    resetCompilerState()
    try {
      await remixClient.discardHighlight()
      let _contract: any
      try {
        _contract = await remixClient.getContract()
      } catch (e: any) {
        setOutput('', {status: 'failed', message: e.message})
        return
      }
      remixClient.changeStatus({
        key: 'loading',
        type: 'info',
        title: 'Compiling'
      })
      let output
      try {
        output = await compile(compilerUrl, _contract)
      } catch (e: any) {
        setOutput(_contract.name, {status: 'failed', message: e.message})
        return
      }
      const compileReturnType = () => {
        const t: any = toStandardOutput(contract, output)
        const temp = _.merge(t['contracts'][contract])
        const normal = normalizeContractPath(contract)[2]
        const abi = temp[normal]['abi']
        const evm = _.merge(temp[normal]['evm'])
        const dpb = evm.deployedBytecode
        const runtimeBytecode = evm.bytecode

        const result = {
          contractName: normal,
          abi: abi,
          bytecode: dpb,
          runtimeBytecode: runtimeBytecode,
          ir: ''
        }
        return result
      }
      setOutput(_contract.name, compileReturnType())

      // ERROR
      if (isCompilationError(output)) {
        const line = output.line
        if (line) {
          const lineColumnPos = {
            start: {line: line - 1, column: 10},
            end: {line: line - 1, column: 10}
          }
          remixClient.highlight(lineColumnPos as any, _contract.name, '#e0b4b4')
        } else {
          const regex = output.message.match(/line ((\d+):(\d+))+/g)
          const errors = output.message.split(/line ((\d+):(\d+))+/g) // extract error message
          if (regex) {
            let errorIndex = 0
            regex.map((errorLocation) => {
              const location = errorLocation.replace('line ', '').split(':')
              let message = errors[errorIndex]
              errorIndex = errorIndex + 4
              if (message && message.split('\n\n').length > 0) {
                try {
                  message = message.split('\n\n')[message.split('\n\n').length - 1]
                } catch (e) {}
              }
              if (location.length > 0) {
                const lineColumnPos = {
                  start: {line: parseInt(location[0]) - 1, column: 10},
                  end: {line: parseInt(location[0]) - 1, column: 10}
                }
                remixClient.highlight(lineColumnPos as any, _contract.name, message)
              }
            })
          }
        }
        throw new Error(output.message)
      }
      // SUCCESS
      remixClient.discardHighlight()
      remixClient.changeStatus({
        key: 'succeed',
        type: 'success',
        title: 'succeed'
      })
      const data = toStandardOutput(_contract.name, output)
      remixClient.compilationFinish(_contract.name, _contract.content, data)
    } catch (err: any) {
      remixClient.changeStatus({
        key: 'failed',
        type: 'error',
        title: err.message
      })
    }
  }

  return (
    <Button data-id="compile" onClick={compileContract} variant="primary" title={contract} className="d-flex flex-column">
      <span>Compile</span>
      <span className="overflow-hidden text-truncate text-nowrap">{contract}</span>
    </Button>
  )
}

export default CompilerButton
