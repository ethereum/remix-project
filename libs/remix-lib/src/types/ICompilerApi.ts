export interface ICompilerApi {
    currentFile: string
    contractMap: {
      file: string
    } | Record<string, any>
    compileErrors: any
    compileTabLogic: any
    contractsDetails: Record<string, any>
    configurationSettings: ConfigurationSettings

    getCompilerParameters: () => ConfigurationSettings
    setCompilerParameters: (ConfigurationSettings?) => void

    getAppParameter: (value: string) => string | boolean
    setAppParameter: (name: string, value: string | boolean) => void

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

    resolveContentAndSave: (url: string) => Promise<string>

    fileExists: (file: string) => Promise<boolean>
    writeFile: (file: string, content: string) => Promise<void>
    readFile: (file: string) => Promise<string>
    open: (file: string) => void
    saveCurrentFile: () => void

    logToTerminal: (log: terminalLog) => {}

    compileWithHardhat: (configPath: string) => Promise<string>
}

export type terminalLog = {
    type: 'info' | 'error' | 'warning'
    value: string
}

export interface ConfigurationSettings {
    version: string,
    evmVersion: string,
    language: string,
    optimize: boolean,
    runs: string

}
