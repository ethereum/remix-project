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
  tooltip: (message: string | JSX.Element) => void, // eslint-disable-line no-undef
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void, // eslint-disable-line no-undef
  compiledFileName: string,
  updateCurrentVersion: any,
  configurationSettings: ConfigurationSettings
}
export interface ContractSelectionProps {
  api: ICompilerApi,
  contractMap: {
    file: string
  } | Record<string, any>,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void, // eslint-disable-line no-undef
  contractsDetails: Record<string, any>
}
