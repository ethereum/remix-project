import {CompilationResult, ABIDescription} from '@remixproject/plugin-api'
import axios from 'axios'

export interface Contract {
  name: string
  content: string
}

export interface VyperCompilationResult {
  status: 'success'
  bytecode: string
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
    if(i !== paths.length -1) {
      folders += `${paths[i]}/`
    }
  }
  const resultingPath = `${folders}${filename}`
  return [folders,resultingPath, filename]
}

/**
 * Compile the a contract
 * @param url The url of the compiler
 * @param contract The name and content of the contract
 */
export async function compile(url: string, contract: Contract): Promise<any | VyperCompilationOutput> {
  if (!contract.name) {
    throw new Error('Set your Vyper contract file.')
  }
  const extension = contract.name.split('.')[1]
  if (extension !== 'vy') {
    throw new Error('Use extension .vy for Vyper.')
  }

  const files = new FormData();
  const content = new Blob([contract.content], {
    type: 'text/plain'
  });
  const nameResult = normalizeContractPath(contract.name)
  files.append('files', content, `${nameResult[2]}.vy`)
  const response = await axios.post(url + '/compile?vyper_version=0.2.16', files)

  if (response.data.status === 404) {
    throw new Error(`Vyper compiler not found at "${url}".`)
  }
  if (response.data.status === 400) {
    throw new Error(`Vyper compilation failed: ${response.statusText}`)
  }

  const statusResponse = await axios.get(`${url}/status/${response.data}`)
  let responsePayload = {}
  if (statusResponse.data !== 'SUCCESS' && statusResponse.data !== 'FAILED') {
    const errorResponse = await axios.get(`${url}/exceptions/${response.data}`)
    responsePayload = errorResponse.data
    return responsePayload
  }

  const resultResponse = await axios.get(`${url}/compiled_artifact/${response.data}`)
  console.log({ resultResponse })
  return resultResponse.data
}

/**
 * Transform Vyper Output to Solidity-like Compiler output
 * @param name Name of the contract file
 * @param compilationResult Result returned by the compiler
 */
export function toStandardOutput(fileName: string, compilationResult: VyperCompilationResult | any): CompilationResult {
  const contractName = fileName.split('/').slice(-1)[0].split('.')[0]

  if (compilationResult.contractTypes.ast.name !== undefined) {
    console.log('compilationResult found')
    return compilationResult
  }
  const methodIdentifiers = JSON.parse(JSON.stringify(compilationResult['method_identifiers']).replace(/0x/g, ''))
  return {
    sources: {
      [fileName]: {
        id: 1,
        ast: {} as any,
        legacyAST: {} as any
      }
    },
    contracts: {
      [fileName]: {
        // If the language used has no contract names, this field should equal to an empty string
        [contractName]: {
          // The Ethereum Contract ABI. If empty, it is represented as an empty array.
          // See https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
          abi: compilationResult['abi'],
          evm: {
            bytecode: {
              linkReferences: {},
              object: compilationResult['bytecode'].replace('0x', ''),
              opcodes: ''
            },
            deployedBytecode: {
              linkReferences: {},
              object: compilationResult['bytecode_runtime'].replace('0x', ''),
              opcodes: ''
            },
            methodIdentifiers: methodIdentifiers
          }
        }
      } as any
    }
  }
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
