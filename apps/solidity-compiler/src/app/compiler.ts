/* eslint-disable no-undef */
/* eslint-disable dot-notation */
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


const defaultAppParameters = {
  hideWarnings: false,
  autoCompile: false,
  includeNightlies: false
}

const defaultCompilerParameters = {
  runs: '200',
  optimize: false,
  version: 'soljson-v0.8.7+commit.e28d00a7',
  evmVersion: null, // compiler default
  language: 'Solidity'
}

  constructor () {
    super()
    createClient(this as any)
    this.initCompilerApi()
  }  
}
