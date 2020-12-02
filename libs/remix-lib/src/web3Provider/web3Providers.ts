import { Web3VmProvider } from './web3VmProvider'
import { loadWeb3, extendWeb3 } from '../init'

export class Web3Providers {

  modes
  constructor() {
    this.modes = {}
  }

  addProvider (type, obj) {
    if (type === 'INTERNAL') {
      const web3 = loadWeb3()
      this.addWeb3(type, web3)
    } else if (type === 'vm') {
      this.addVM(type, obj)
    } else {
      extendWeb3(obj)
      this.addWeb3(type, obj)
    }
  }

  get (type, cb) {
    if (this.modes[type]) {
      return cb(null, this.modes[type])
    }
    cb('error: this provider has not been setup (' + type + ')', null)
  }

  addWeb3 (type, web3) {
    this.modes[type] = web3
  }

  addVM (type, vm) {
    const vmProvider = new Web3VmProvider()
    vmProvider.setVM(vm)
    this.modes[type] = vmProvider
  }
}
