const version = require('../../package.json').version
import web3 from 'web3'

export class Misc {

  methods () {
    return {
      web3_clientVersion: this.web3_clientVersion.bind(this),
      eth_protocolVersion: this.eth_protocolVersion.bind(this),
      eth_syncing: this.eth_syncing.bind(this),
      eth_mining: this.eth_mining.bind(this),
      eth_hashrate: this.eth_hashrate.bind(this),
      web3_sha3: this.web3_sha3.bind(this),
      eth_getCompilers: this.eth_getCompilers.bind(this),
      eth_compileSolidity: this.eth_compileSolidity.bind(this),
      eth_compileLLL: this.eth_compileLLL.bind(this),
      eth_compileSerpent: this.eth_compileSerpent.bind(this)
    }
  }

  web3_clientVersion (payload, cb) {
    cb(null, 'Remix Simulator/' + version)
  }

  eth_protocolVersion (payload, cb) {
    cb(null, '0x3f')
  }

  eth_syncing (payload, cb) {
    cb(null, false)
  }

  eth_mining (payload, cb) {
    // TODO: should depend on the state
    cb(null, false)
  }

  eth_hashrate (payload, cb) {
    cb(null, '0x0')
  }

  web3_sha3 (payload, cb) {
    const str = payload.params[0]
    cb(null, web3.utils.sha3(str))
  }

  eth_getCompilers (payload, cb) {
    cb(null, [])
  }

  eth_compileSolidity (payload, cb) {
    cb(null, 'unsupported')
  }

  eth_compileLLL (payload, cb) {
    cb(null, 'unsupported')
  }

  eth_compileSerpent (payload, cb) {
    cb(null, 'unsupported')
  }
}
