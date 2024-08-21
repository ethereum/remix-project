import { ICompilerApi, ConfigurationSettings, iSolJsonBinData } from '@remix-project/remix-lib'
import { CompileTabLogic } from '../logic/compileTabLogic'
export type onCurrentFileChanged = (fileName: string) => void

//// SolidityScan Types

export interface ScanTemplate {
  issue_id: string
  issue_name: string
  issue_remediation?: string
  issue_severity: string
  issue_status: string
  static_issue_description: string
  issue_description?: string
  issue_confidence: string
  metric_wise_aggregated_findings?: Record<string, any>[]
}

export interface ScanDetails {
  issue_id: string
  no_of_findings: string
  metric_wise_aggregated_findings?: Record<string, any>[]
  positions?: string
  template_details: ScanTemplate
}

export interface ScanReport {
  details_enabled: boolean
  file_url_list: string[]
  multi_file_scan_details: ScanDetails[]
  multi_file_scan_summary: Record<string, any>
  multi_file_scan_status: string
  scan_id: string
  scan_status: string
  scan_type: string
  // others
}

//// SolidityScan Types

export interface SolidityCompilerProps {
  api: ICompilerApi
}

export interface CompilerContainerProps {
  api: ICompilerApi,
  pluginProps: SolidityCompilerProps,
  compileTabLogic: CompileTabLogic,
  isHardhatProject: boolean,
  isTruffleProject: boolean,
  isFoundryProject: boolean,
  workspaceName: string,
  tooltip: (message: string | JSX.Element) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, donotHideOnOkClick?: boolean, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string,
  updateCurrentVersion: any,
  configurationSettings: ConfigurationSettings,
  configFilePath: string,
  setConfigFilePath: (path: string) => void,
  solJsonBinData: iSolJsonBinData
}

export interface ContractSelectionProps {
  api: ICompilerApi,
  compiledFileName: string,
  contractList: { file: string, name: string }[],
  compilerInput: Record<string, any>
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, donotHideOnOkClick?: boolean, cancelLabel?: string, cancelFn?: () => void) => void,
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
  target?: string,
  input?: Record<string, any>
}

export interface ContractsFile {
 [currentFile: string]: CompilationDetails
}

export type ContractPropertyName = 'compilerInput' | 'name' | 'metadata' | 'bytecode' | 'abi' | 'storageLayout'
  | 'web3Deploy' | 'metadataHash' | 'functionHashes' | 'gasEstimates' | 'devdoc' | 'userdoc' | 'Runtime Bytecode'
  | 'Assembly'
