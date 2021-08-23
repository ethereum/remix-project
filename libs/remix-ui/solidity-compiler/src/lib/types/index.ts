export type onCurrentFileChanged = (fileName: string) => void

export interface SolidityCompilerProps {
  plugin: ICompilerApi
}

export interface ICompilerApi {
  currentFile: string
  contractMap: {
    file: string
  } | Record<string, any>
  compileErrors: any
  compileTabLogic: any
  contractsDetails: Record<string, any>
  configurationSettings: ConfigurationSettings

  setHardHatCompilation: (value: boolean) => void
  getParameters: () => any
  setParameters: (params) => void
  getConfiguration: (value: string) => string
  setConfiguration: (name: string, value: string) => void
  getFileManagerMode: () => string
  setCompilerConfig: (settings: any) => void

  getCompilationResult: () => any

  onCurrentFileChanged: (fileName: string) => void
  onResetResults: () => void,
  onSetWorkspace: (isLocalhost: boolean) => void
  onNoFileSelected: () => void
  onCompilationFinished: (contractsDetails: any, contractMap: any) => void
  onSessionSwitched: () => void
  onContentChanged: () => void

  fileExists: (file: string) => Promise<boolean>
  writeFile: (file: string, content: string) => Promise<void>
  readFile: (file: string) => Promise<string>
  open: (file: string) => void
}

export interface CompilerContainerProps {
  api: any,
  compileTabLogic: any,
  isHardhatProject: boolean,
  tooltip: (message: string | JSX.Element) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string,
  updateCurrentVersion: any,
  configurationSettings: ConfigurationSettings
}
export interface ContractSelectionProps {
  api: any,
  contractMap: {
    file: string
  } | Record<string, any>,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  contractsDetails: Record<string, any>
}

export interface ConfigurationSettings {
  version: string,
  evmVersion: string,
  language: string,
  optimize: boolean,
  runs: string
}
