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
    onSetWorkspace: (workspace: any) => void
    onNoFileSelected: () => void
    onCompilationFinished: (contractsDetails: any, contractMap: any) => void
    onSessionSwitched: () => void
    onContentChanged: () => void

    fileExists: (file: string) => Promise<boolean>
    writeFile: (file: string, content: string) => Promise<void>
    readFile: (file: string) => Promise<string>
    open: (file: string) => void
  }

export interface ConfigurationSettings {
    version: string,
    evmVersion: string,
    language: string,
    optimize: boolean,
    runs: string
}
