import { Engine } from '@remixproject/engine'
import { EventEmitter } from 'events'

export class RemixEngine extends Engine {
  constructor () {
    super()
    this.event = new EventEmitter()
  }

  setPluginOption ({ name, kind }) {
    if (kind === 'provider') return { queueTimeout: 60000 * 2 }
    if (name === 'LearnEth') return { queueTimeout: 60000 }
    if (name === 'dGitProvider') return { queueTimeout: 60000 * 4 }
    if (name === 'slither') return { queueTimeout: 60000 * 4 } // Requires when a solc version is installed
    if (name === 'hardhat') return { queueTimeout: 60000 * 4 }
    if (name === 'truffle') return { queueTimeout: 60000 * 4 }
    if (name === 'localPlugin') return { queueTimeout: 60000 * 4 }
    if (name === 'notification') return { queueTimeout: 60000 * 4 }
    if (name === 'sourcify') return { queueTimeout: 60000 * 4 }
    if (name === 'fetchAndCompile') return { queueTimeout: 60000 * 4 }
    if (name === 'walletconnect') return { queueTimeout: 60000 * 4 }
    return { queueTimeout: 10000 }
  }

  onRegistration (plugin) {
    this.event.emit('onRegistration', plugin)
  }
}
