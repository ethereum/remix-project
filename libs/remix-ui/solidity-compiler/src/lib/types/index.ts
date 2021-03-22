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
  tooltip: (message: string) => void,
  modal: (title: string, message: string | JSX.Element, ok: { label: string, fn: () => void }, cancel: { label: string, fn: () => void }) => void
}
export interface ContractSelectionProps {
  contractMap: {
    file: string
  }
}
