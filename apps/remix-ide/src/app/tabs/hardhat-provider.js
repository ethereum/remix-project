import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
const modalDialogCustom = require('../ui/modal-dialog-custom')
import Web3 from 'web3'

const profile = {
  name: 'hardhat-provider',
  displayName: 'Hardhat Provider',
  kind: 'provider',
  description: 'Hardhat provider',
  methods: ['sendAsync'],
  version: packageJson.version
}

export default class HardhatProvider extends Plugin {
    constructor () {
      super(profile)
      this.provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
    }

    web3ProviderDialogBody () {
      const thePath = '<path/to/local/folder/for/test/chain>'
  
      return yo`
        <div class="">
          Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank">Geth Docs on rpc server</a>)
          <div class="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
          <br>
          To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank">Geth Docs on Dev mode</a>)
          <div class="border p-1">geth --http --http.corsdomain="${window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir ${thePath} --dev console</div>
          <br>
          <br> 
          <b>WARNING:</b> It is not safe to use the --http.corsdomain flag with a wildcard: <b>--http.corsdomain *</b>
          <br>
          <br>For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank">Remix Docs on Web3 Provider</a>
          <br>
          <br> 
          Hardhat Provider Endpoint
        </div>
      `
    }

    sendAsync (data) {
      console.log('Inside sendAsync - modalDialogCustom', modalDialogCustom)
      modalDialogCustom.prompt('Hardhat node request', this.web3ProviderDialogBody(), 'http://127.0.0.1:8545')
        // return new Promise((resolve, reject) => {
        //   if (this.provider) {
        //     this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
        //       if (error) return reject(error)
        //       resolve(message)
        //     })
        //   } else {
        //     resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
        //   }
        // })
      }
}

module.exports = HardhatProvider