
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
  contractsDetails: Record<string, any>
}

export interface CompilerContainerProps {
  editor: any,
  config: any,
  queryParams: any,
  compileTabLogic: any,
  tooltip: (message: string) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string
}
export interface ContractSelectionProps {
  contractMap: {
    file: string
  } | Record<string, any>,
  fileManager: any,
  fileProvider: any
}
