import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { CompilerApiMixin } from './compiler-api'
import { ICompilerApi } from '@remix-project/remix-lib-ts'
<<<<<<< HEAD
import { CompileTabLogic } from '@remix-ui/solidity-compiler'
=======
>>>>>>> 49c62946c (better org of types)

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

const defaultAppParameters = {
  hideWarnings: false,
  autoCompile: false,
  includeNightlies: false
}

<<<<<<< HEAD
const defaultCompilerParameters = {
  runs: '200',
  optimize: false,
  version: 'soljson-v0.8.7+commit.e28d00a7',
  evmVersion: null, // compiler default
  language: 'Solidity'
}
=======
export class CompilerClientApi extends CompilerApiMixin(PluginClient) implements ICompilerApi  {
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
>>>>>>> 49c62946c (better org of types)

export class CompilerClientApi extends CompilerApiMixin(PluginClient) implements ICompilerApi  {
  constructor () {
    super()
    createClient(this as any)
    this.compileTabLogic = new CompileTabLogic(this, this.contentImport)
    this.compiler = this.compileTabLogic.compiler
    this.compileTabLogic.init()
    this.initCompilerApi()
  }

  getCompilerParameters () {
    const params = {
      runs: localStorage.getItem('runs') || defaultCompilerParameters['runs'],
      optimize: localStorage.getItem('optimize') === 'true' ? true : false,
      version: localStorage.getItem('version') || defaultCompilerParameters['version'],
      evmVersion: localStorage.getItem('evmVersion') || defaultCompilerParameters['evmVersion'], // default
      language: localStorage.getItem('language') || defaultCompilerParameters['language']
    }
    return params
  }

  setCompilerParameters (params) {
    for (const key of Object.keys(params)) {
      localStorage.setItem(key, params[key])
    }
  }

  getAppParameter (name) {
    const param = localStorage.getItem(name) || defaultAppParameters[name]
    if (param === 'true') return true
    if (param === 'false') return false
    return param
  }

  setAppParameter (name, value) {
    localStorage.setItem(name, value)
  }

  getFileManagerMode () {
    return 'browser'
  }
}
