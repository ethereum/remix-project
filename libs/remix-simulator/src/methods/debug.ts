export class Debug {
  vmContext

  constructor (vmContext) {
    this.vmContext = vmContext
  }

  methods () {
    return {
      debug_traceTransaction: this.debug_traceTransaction.bind(this),
      debug_preimage: this.debug_preimage.bind(this),
      debug_storageRangeAt: this.debug_storageRangeAt.bind(this)
    }
  }

  debug_traceTransaction (payload, cb) {
    this.vmContext.web3().debug.traceTransaction(payload.params[0], {}, cb)
  }

  debug_preimage (payload, cb) {
    this.vmContext.web3().debug.preimage(payload.params[0], cb)
  }

  debug_storageRangeAt (payload, cb) {
    this.vmContext.web3().debug.storageRangeAt(
      payload.params[0],
      payload.params[1],
      payload.params[2],
      payload.params[3],
      payload.params[4],
      cb)
  }
}
