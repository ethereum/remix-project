import { ICompilerApi, ConfigurationSettings } from '@remix-project/remix-lib-ts'
<<<<<<< HEAD
import { CompileTabLogic } from '../logic/compileTabLogic'
export type onCurrentFileChanged = (fileName: string) => void

export interface SolidityCompilerProps {
  api: ICompilerApi
=======
export type onCurrentFileChanged = (fileName: string) => void

export interface SolidityCompilerProps {
  plugin: ICompilerApi
>>>>>>> 49c62946c (better org of types)
}

export interface CompilerContainerProps {
  api: ICompilerApi,
  compileTabLogic: CompileTabLogic,
  isHardhatProject: boolean,
  tooltip: (message: string | JSX.Element) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string,
  updateCurrentVersion: any,
  configurationSettings: ConfigurationSettings
}
export interface ContractSelectionProps {
  api: ICompilerApi,
  contractMap: {
    file: string
  } | Record<string, any>,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  contractsDetails: Record<string, any>
<<<<<<< HEAD
}
=======
}
>>>>>>> 49c62946c (better org of types)
