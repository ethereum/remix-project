import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { CompilerApiMixin } from './compiler-api'

export interface ConfigurationSettings {
  version: string,
  evmVersion: string,
  language: string,
  optimize: boolean,
  runs: string
}

export class CompilerClientApi extends CompilerApiMixin(PluginClient) {
  contractMap: {
    file: string
  } | Record<string, any>
  compileErrors: any
  compileTabLogic: any
  contractsDetails: Record<string, any>
  contentImport: any
  call: (...args) => void
  on: (...args) => void
  setSelectedVersion: (value: string) => void
  configurationSettings: ConfigurationSettings
  getConfiguration: (value: string) => string
  setConfiguration: (name: string, value: string) => void
  currentFile: string

  onCurrentFileChanged: (fileName: string) => void
  onResetResults: () => void
  onSetWorkspace: (workspace: any) => void
  onNoFileSelected: () => void
  onCompilationFinished: (contractsDetails: any, contractMap: any) => void

  constructor () {
    super()
    createClient(this as any)
    this.initCompilerApi()
  }  
}
