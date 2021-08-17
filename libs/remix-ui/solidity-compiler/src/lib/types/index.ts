export interface SolidityCompilerProps {
  plugin: {
    contractMap: {
      file: string
    } | Record<string, any>
    compileErrors: any,
    isHardHatProject: boolean,
    compileTabLogic: any,
    contractsDetails: Record<string, any>,
    contentImport: any,
    call: (...args) => void
    on: (...args) => void,
    setHardHatCompilation: (value: boolean) => void,
    setSelectedVersion: (value: string) => void,
    configurationSettings: ConfigurationSettings,
    getConfiguration: (value: string) => string,
    setConfiguration: (name: string, value: string) => void
  },
}

export interface CompilerContainerProps {
  api: any,
  compileTabLogic: any,
  tooltip: (message: string | JSX.Element) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  compiledFileName: string,
  setHardHatCompilation: (value: boolean) => void,
  updateCurrentVersion: any,
  isHardHatProject: boolean,
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
