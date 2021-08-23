import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { CompilerApiMixin } from './compiler-api'

const profile = {
  name: 'solidity',
  displayName: 'Solidity compiler',
  icon: 'assets/img/solidity.webp',
  description: 'Compile solidity contracts',
  kind: 'compiler',
  permission: true,
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/solidity_editor.html',
  version: '0.0.1',
  methods: ['getCompilationResult', 'compile', 'compileWithParameters', 'setCompilerConfig', 'compileFile' ,'getCompilerState']
}

export interface ConfigurationSettings {
  version: string,
  evmVersion: string,
  language: string,
  optimize: boolean,
  runs: string
}

export class CompilerClientApi extends CompilerApiMixin(PluginClient) {
  // interface matches libs/remix-ui/solidity-compiler/types/index.ts : ICompilerApi
  currentFile: string
  contractMap: {
    file: string
  } | Record<string, any>
  compileErrors: any
  compileTabLogic: any
  contractsDetails: Record<string, any>
  configurationSettings: ConfigurationSettings

  setHardHatCompilation: (value: boolean) => void
  getParameters: () => ConfigurationSettings
  setParameters: (params: Partial<ConfigurationSettings>) => void
  setCompilerConfig: (settings: ConfigurationSettings) => void
  
  getConfiguration: (value: string) => string
  setConfiguration: (name: string, value: string) => void
  getFileManagerMode: () => string
  

  getCompilationResult: () => any

  onCurrentFileChanged: (fileName: string) => void
  onResetResults: () => void
  onSetWorkspace: (isLocalhost: boolean) => void
  onNoFileSelected: () => void
  onCompilationFinished: (contractsDetails: any, contractMap: any) => void
  onSessionSwitched: () => void
  onContentChanged: () => void

  fileExists: (file: string) => Promise<boolean>
  writeFile: (file: string, content: string) => Promise<void>
  readFile: (file: string) => Promise<string>
  open: (file: string) => void

  constructor () {
    super()
    createClient(this as any)
    this.initCompilerApi()
  }  
}
