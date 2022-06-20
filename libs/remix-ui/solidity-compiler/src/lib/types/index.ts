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
  configurationSettings: ConfigurationSettings,
  configFilePath: string,
  setConfigFilePath: (path: string) => void
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
