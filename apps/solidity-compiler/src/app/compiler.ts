import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { CompilerApiMixin } from './compiler-api'
import { ICompilerApi } from '@remix-project/remix-lib-ts'

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
    return {
      runs: '200',
      optimize: false,
      version: '0.8.7+commit.e28d00a7',
      evmVersion: null, // default
      language: 'Solidity'
    }
  }

  setCompilerParameters (params) {}

  getAppParameter (name) {
    const conf = {
      'currentFile': () => this.currentFile,
      'hideWarnings': () => false,
      'autoCompile': () => false,
      'includeNightlies': () => false
    }
    return conf[name]()
  }

  setAppParameter (name, value) {}  
}
