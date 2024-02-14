import { ABIDescription} from '@remixproject/plugin-api'
import axios from 'axios'
import { remixClient } from './remix-client'
import _ from 'lodash'


export interface Contract {
  name: string
  content: string
}

export interface VyperCompilationResult {
  status: 'success'
  bytecode: string
  contractName?: string
  bytecode_runtime: string
  abi: ABIDescription[]
  ir: string
  method_identifiers: {
    [method: string]: string
  }
}

export interface VyperCompilationError {
  status: 'failed'
  column?: number
  line?: number
  message: string
}

export type VyperCompilationOutput = VyperCompilationResult | VyperCompilationError

/** Check if the output is an error */
export function isCompilationError(output: VyperCompilationOutput): output is VyperCompilationError {
  return output.status === 'failed'
}

export function normalizeContractPath(contractPath: string): string[] {
  const paths = contractPath.split('/')
  const filename = paths[paths.length - 1].split('.')[0]
  let folders = ''
  for (let i = 0; i < paths.length - 1; i++) {
    if (i !== paths.length -1) {
      folders += `${paths[i]}/`
    }
  }
  const resultingPath = `${folders}${filename}`
  return [folders,resultingPath, filename]
}

function parseErrorString(errorString) {
  // Split the string into lines
  let lines = errorString.trim().split('\n')
  // Extract the line number and message
  let message = lines[1].trim()
  let targetLine = lines[2].split(',')
  let lineColumn = targetLine[targetLine.length - 1].split(' ')[2].split(':')
  const errorObject = {
    status: 'failed',
    message: message,
    column: parseInt(lineColumn[1]),
    line: parseInt(lineColumn[0])
  }
  message = null
  targetLine = null
  lineColumn = null
  lines = null
  return errorObject
}

/**
 * Compile the a contract
 * @param url The url of the compiler
 * @param contract The name and content of the contract
 */
export async function compile(url: string, contract: Contract): Promise<any> {
  if (!contract.name) {
    throw new Error('Set your Vyper contract file.')
  }
  const extension = contract.name.split('.')[1]
  if (extension !== 'vy') {
    throw new Error('Use extension .vy for Vyper.')
  }

  let contractName = contract['name']
  const compilePackage = {
    manifest: 'ethpm/3',
    sources: {
      [contractName] : {content : contract.content}
    }
  }
  let response = await axios.post(`${url}compile`, compilePackage )

  if (response.status === 404) {
    throw new Error(`Vyper compiler not found at "${url}".`)
  }
  if (response.status === 400) {
    throw new Error(`Vyper compilation failed: ${response.statusText}`)
  }

  const compileCode = response.data
  contractName = null
  response = null
  let result: any

  const status = await (await axios.get(url + 'status/' + compileCode , {
    method: 'Get'
  })).data
  if (status === 'SUCCESS') {
    result = await(await axios.get(url + 'artifacts/' + compileCode , {
      method: 'Get'
    })).data

    return result
  } else if (status === 'FAILED') {
    const intermediate = await(await axios.get(url + 'exceptions/' + compileCode , {
      method: 'Get'
    })).data
    result = parseErrorString(intermediate[0])
    return result
  }
  await new Promise((resolve) => setTimeout(() => resolve({}), 3000))
}

/**
 * Transform Vyper Output to Solidity-like Compiler output
 * @param name Name of the contract file
 * @param compilationResult Result returned by the compiler
 */
export function toStandardOutput(fileName: string, compilationResult: any): any {
  const contractName = normalizeContractPath(fileName)[2]
  const compiledAbi = compilationResult['contractTypes'][contractName].abi
  const deployedBytecode = compilationResult['contractTypes'][contractName].deploymentBytecode.bytecode.replace('0x', '')
  const bytecode = compilationResult['contractTypes'][contractName].runtimeBytecode.bytecode.replace('0x', '')
  const compiledAst = compilationResult['contractTypes'][contractName].ast
  const methodIds = compilationResult['contractTypes'][contractName].methodIdentifiers
  const methodIdentifiers = Object.entries(methodIds as Record<any,string>).map(([key, value]) => {
    return { [key]: value.replace('0x', '') }
  })
  return {
    sources: {
      [fileName]: {
        id: 1,
        ast: compiledAst
      }
    },
    contracts: {
      [fileName]: {
        // If the language used has no contract names, this field should equal to an empty string
        [contractName]: {
          // The Ethereum Contract ABI. If empty, it is represented as an empty array.
          // See https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
          abi: compiledAbi,
          contractName: contractName,
          evm: {
            bytecode: {
              linkReferences: {},
              object: deployedBytecode,
              opcodes: ''
            },
            deployedBytecode: {
              linkReferences: {},
              object: bytecode,
              opcodes: ''
            },
            methodIdentifiers: methodIdentifiers
          }
        }
      } as any
    }
  }
}


export async function compileContract(contract: string, compilerUrl: string, setOutput?: any) {
  remixClient.eventEmitter.emit('resetCompilerState', {})

  try {
    // await remixClient.discardHighlight()
    let _contract: any
    try {
      _contract = await remixClient.getContract()
    } catch (e: any) {
      // if (setOutput === null || setOutput === undefined) {
      const compileResult = {
        status: 'failed',
        message: e.message
      }
      remixClient.eventEmitter.emit('setOutput', compileResult)
      // } else {
      //   setOutput('', {status: 'failed', message: e.message})
      // }
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
      console.log('checking compile result', output)
      remixClient.eventEmitter.emit('setOutput', output)
    } catch (e: any) {
      remixClient.changeStatus({
        key: 'failed',
        type: 'error',
        title: `${e.message} debugging`
      })
      // setOutput !== null || setOutput !== undefined && setOutput('', {status: 'failed', message: e.message})
      remixClient.eventEmitter.emit('setOutput', {status: 'failed', message: e.message})
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
      const methodIdentifiers = evm.methodIdentifiers

      const result = {
        contractName: normal,
        abi: abi,
        bytecode: dpb,
        runtimeBytecode: runtimeBytecode,
        ir: '',
        methodIdentifiers: methodIdentifiers
      }
      return result
    }

    // ERROR
    if (isCompilationError(output)) {
      const line = output.line
      if (line) {
        const lineColumnPos = {
          start: {line: line - 1, column: 10},
          end: {line: line - 1, column: 10}
        }
        // remixClient.highlight(lineColumnPos as any, _contract.name, '#e0b4b4')
      } else {
        const regex = output?.message?.match(/line ((\d+):(\d+))+/g)
        const errors = output?.message?.split(/line ((\d+):(\d+))+/g) // extract error message
        if (regex) {
          let errorIndex = 0
          regex.map((errorLocation) => {
            const location = errorLocation?.replace('line ', '').split(':')
            let message = errors[errorIndex]
            errorIndex = errorIndex + 4
            if (message && message?.split('\n\n').length > 0) {
              try {
                message = message?.split('\n\n')[message.split('\n\n').length - 1]
              } catch (e) {}
            }
            if (location?.length > 0) {
              const lineColumnPos = {
                start: {line: parseInt(location[0]) - 1, column: 10},
                end: {line: parseInt(location[0]) - 1, column: 10}
              }
              // remixClient.highlight(lineColumnPos as any, _contract.name, message)
            }
          })
        }
      }
      throw new Error(output.message)
    }
    // SUCCESS
    // remixClient.discardHighlight()
    remixClient.changeStatus({
      key: 'succeed',
      type: 'success',
      title: 'success'
    })

    const data = toStandardOutput(_contract.name, output)
    remixClient.compilationFinish(_contract.name, _contract.content, data)
    if (setOutput === null || setOutput === undefined) {
      const contractName = _contract['name']
      const compileResult = compileReturnType()
      remixClient.eventEmitter.emit('setOutput', { contractName, compileResult })
    } else {
      setOutput(_contract.name, compileReturnType())
    }
  } catch (err: any) {
    remixClient.changeStatus({
      key: 'failed',
      type: 'error',
      title: err.message
    })
    remixClient.eventEmitter.emit('setOutput', {status: 'failed', message: err.message})
  }
}




export type StandardOutput = {
  sources: {
    [fileName: string]: {
      id: number,
      ast: AST
    }
  },
  contracts: {
    [fileName: string]: {
      [contractName: string]: {
        abi: ABI,
        contractName: string,
        evm: {
          bytecode: BytecodeObject,
          deployedBytecode: BytecodeObject,
          methodIdentifiers: {
            [method: string]: string
          }
        }
      }
    }
  }
}

type AST = any // Replace with the actual AST type
type ABI = ABIDescription[] // Replace with the actual ABI type
type BytecodeObject = {
  linkReferences: Record<string, any>,
  object: string,
  opcodes: string
}

/*
export function createCompilationResultMessage(name: string, result: any) {
  if(result.status == 'success') {
    return {
      bytecode: this.state.compilationResult['bytecode'],
      bytecode_runtime: this.state.compilationResult['bytecode_runtime'],
      abi: JSON.stringify(this.state.compilationResult['abi'], null , "\t"),
      ir: this.state.compilationResult['ir']
    }
  } else if(result.status == 'failed' && result.column && result.line) {
    const header = `${name}:${result.line}:${result.column}`
    const body = this.state.compilationResult.message.split(/\r\n|\r|\n/)
    const arr = [header].concat(body).join("\n")
    return {
      bytecode: arr,
      bytecode_runtime: arr,
      abi: arr,
      ir: arr
    }
  } else if(result.status == 'failed') {
    const message = this.state.compilationResult.message
    return {
      bytecode: message,
      bytecode_runtime: message,
      abi: message,
      ir: message
    }
  }
  return {
    bytecode: "",
    bytecode_runtime: "",
    abi: "",
    ir: ""
  }
}
*/
