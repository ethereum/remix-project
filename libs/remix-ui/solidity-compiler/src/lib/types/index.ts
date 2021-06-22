
export interface SolidityCompilerProps {
  editor: any,
  config: any,
  fileProvider: any,
  fileManager: any,
  contentImport: any,
  plugin: any,
  queryParams: any,
  compileTabLogic: any
}

export interface CompilerContainerProps {
  editor: any,
  config: any,
  queryParams: any,
  compileTabLogic: any,
  tooltip: (message: string) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void
}
export interface ContractSelectionProps {
  contractMap: {
    file: string
  }
}
