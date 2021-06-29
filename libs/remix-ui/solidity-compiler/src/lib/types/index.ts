
export interface SolidityCompilerProps {
  editor: any,
  config: any,
  fileProvider: any,
  fileManager: any,
  contentImport: any,
  plugin: any,
  queryParams: any,
  compileTabLogic: any,
  compiledFileName: string,
  contractsDetails: Record<string, any>,
  setHardHatCompilation: (value: boolean) => void,
  contractMap: {
    file: string
  } | Record<string, any>
  compileErrors: any,
  isHardHatProject: boolean
}

export interface CompilerContainerProps {
  editor: any,
  config: any,
  queryParams: any,
  compileTabLogic: any,
  tooltip: (message: string) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string,
  setHardHatCompilation: (value: boolean) => void,
  updateCurrentVersion: any,
  isHardHatProject: boolean
}
export interface ContractSelectionProps {
  contractMap: {
    file: string
  } | Record<string, any>,
  fileManager: any,
  fileProvider: any,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  contractsDetails: Record<string, any>
}
