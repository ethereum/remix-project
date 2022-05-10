import { ICompilerApi, ConfigurationSettings } from '@remix-project/remix-lib-ts'
import { CompileTabLogic } from '../logic/compileTabLogic'
export type onCurrentFileChanged = (fileName: string) => void

export interface SolidityCompilerProps {
  api: ICompilerApi
}

export interface CompilerContainerProps {
  api: ICompilerApi,
  compileTabLogic: CompileTabLogic,
  isHardhatProject: boolean,
  isTruffleProject: boolean,
  workspaceName: string,
  tooltip: (message: string | JSX.Element) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string,
  updateCurrentVersion: any,
  configurationSettings: ConfigurationSettings
}
export interface ContractSelectionProps {
  api: ICompilerApi,
  contractList: { file: string, name: string }[],
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  contractsDetails: Record<string, any>
}

interface CompileError {
  mode?: string,
  severity?: string,
  formattedMessage?: string,
  type?: string
}

export interface CompileErrors {
  error: CompileError,
  errors: CompileError[]
}

export interface CompilationDetails {
  contractList: { file: string, name: string }[],
  contractsDetails: Record<string, any>,
  target?: string
}

export interface ContractsFile {
 [currentFile: string]: CompilationDetails
}

export const defaultInput = `
{
	"language": "Solidity",
	"settings": {
		"optimizer": {
			"enabled": true,
			"runs": 200
		},
		"outputSelection": {
			"*": {
			"": ["ast"],
			"*": ["abi", "metadata", "devdoc", "userdoc", "storageLayout", "evm.legacyAssembly", "evm.bytecode", "evm.deployedBytecode", "evm.methodIdentifiers", "evm.gasEstimates", "evm.assembly"]
			}
		},
		"evmVersion": "byzantium"
	}
}`

