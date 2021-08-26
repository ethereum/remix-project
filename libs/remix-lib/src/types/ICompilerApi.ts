export interface ICompilerApi {
    currentFile: string
    contractMap: {
      file: string
    } | Record<string, any>
    compileErrors: any
    compileTabLogic: any
    contractsDetails: Record<string, any>
    configurationSettings: ConfigurationSettings
<<<<<<< HEAD

    getCompilerParameters: () => ConfigurationSettings
    setCompilerParameters: (ConfigurationSettings?) => void

    getAppParameter: (value: string) => string | boolean
    setAppParameter: (name: string, value: string | boolean) => void

    getFileManagerMode: () => string
    setCompilerConfig: (settings: any) => void

    getCompilationResult: () => any

=======
  
    setHardHatCompilation: (value: boolean) => void
    getParameters: () => any
    setParameters: (params) => void
    getConfiguration: (value: string) => string
    setConfiguration: (name: string, value: string) => void
    getFileManagerMode: () => string
    setCompilerConfig: (settings: any) => void
  
    getCompilationResult: () => any
  
>>>>>>> 49c62946c (better org of types)
    onCurrentFileChanged: (fileName: string) => void
    onResetResults: () => void,
    onSetWorkspace: (workspace: any) => void
    onNoFileSelected: () => void
    onCompilationFinished: (contractsDetails: any, contractMap: any) => void
    onSessionSwitched: () => void
    onContentChanged: () => void
<<<<<<< HEAD

    resolveContentAndSave: (url: string) => Promise<string>
=======
  
>>>>>>> 49c62946c (better org of types)
    fileExists: (file: string) => Promise<boolean>
    writeFile: (file: string, content: string) => Promise<void>
    readFile: (file: string) => Promise<string>
    open: (file: string) => void
<<<<<<< HEAD
    saveCurrentFile: () => void

    logToTerminal: (log: terminalLog) => {}

    compileWithHardhat: (configPath: string) => Promise<string>
}

export type terminalLog = {
    type: 'info' | 'error' | 'warning'
    value: string
}
=======
  }
>>>>>>> 49c62946c (better org of types)

export interface ConfigurationSettings {
    version: string,
    evmVersion: string,
    language: string,
    optimize: boolean,
    runs: string
<<<<<<< HEAD
}
=======
}
>>>>>>> 49c62946c (better org of types)
