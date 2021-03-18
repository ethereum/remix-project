export interface SolidityCompilerProps {
  editor: any,
  config: any,
  fileProvider: any,
  fileManager: any,
  contentImport: any,
  plugin: any,
  queryParams: any
}

export interface CompilerContainerProps {
  editor: any,
  config: any,
  queryParams: any,
  compileTabLogic: any,
  tooltip: (message: string) => void
}
export interface ContractSelectionProps {
  contractMap: {
    file: string
  }
}
