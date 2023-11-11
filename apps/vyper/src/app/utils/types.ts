import {CompilationResult, ABIDescription} from '@remixproject/plugin-api'

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


export type VyperCompilationResultType = {
  buildDependencies: any
  compilers: [
    contractTypes: [],
    name: string,
    settings: {
      optimize: boolean
      outputSelection: {
        ['fileName']: {
          ['contractName']: string[]
        }
      }
      version: string
    }
  ]
  contractTypes: {
    ['fileName']: {
      abi: any[]
      ast: {
        name: string,
        children: any[]
        classification: number
        col_offset: number
        end_col_offset: number
        end_lineno: number
        lineno: number
        src: {
          length: number
          jump_code: string
        }
      }
      contractName: string
      deploymentBytecode: {
        bytecode: string
      }
      dev_messages: any
      devdoc: {
        methods: any
      }
      pcmap: any
      runtimeBytecode: {
        bytecode: string
      }
      sourceId: string
      sourcemap: string
      userdoc: {
        methods: any
      }
    }
  }
  deployments: any
  manifest: string
  meta: any
  sources: {
    ['fileName'] : {
      checksum: any
      content: string
      imports: string[]
      references: []
      urls: []
    }
  }

}
