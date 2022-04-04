import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import Schema from "@truffle/contract-schema"
// import Config from '@truffle/config'
const Config = require("@truffle/config")
import { Compile } from "@truffle/compile-solidity"
import { Shims } from "@truffle/compile-common"

export class TruffleClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string

  constructor (private readOnly = false) {
    super()
    this.methods = ['compile']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
  }

  async compile (fileName: string, CompConfig) {
    if (this.readOnly) {
      const errMsg = '[Truffle Compilation]: Cannot compile in read-only mode'
      return new Error(errMsg)
    }
    console.log('fileName-in compileWithTruffle-->', fileName)
    console.log('config-in compileWithTruffle-->', CompConfig)

    const sources = {
      Example: await this.call('fileManager', 'getFile', fileName)
    }
    let config = Config.default().with(CompConfig)
    console.log('config---->', config)
    console.log('sources---->', sources)
    // Compile first
    const { compilations } = await Compile.sources({
      sources,
      options: config
    });
    console.log('compilations----->', compilations)
    const { contracts } = compilations[0];
    // use forEach
    const exampleContract = contracts.find(
      contract => contract.contractName === "Owner"
    );
    const compiled = Schema.normalize(
      Shims.NewToLegacy.forContract(exampleContract)
    );
    if(!compiled.updatedAt) compiled.updatedAt = new Date().toISOString()
    console.log('compiled----->', compiled)
    return "done"
  }
}
