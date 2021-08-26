import { ICompilerApi, ConfigurationSettings } from '@remix-project/remix-lib-ts'
export type onCurrentFileChanged = (fileName: string) => void

export interface SolidityCompilerProps {
  plugin: ICompilerApi
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