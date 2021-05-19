export class Filters {
  vmContext

  constructor (vmContext) {
    this.vmContext = vmContext
  }

  methods () {
    return {
      eth_getLogs: this.eth_getLogs.bind(this),
      eth_subscribe: this.eth_subscribe.bind(this),
      eth_unsubscribe: this.eth_unsubscribe.bind(this)
    }
  }

  eth_getLogs (payload, cb) {
    const results = this.vmContext.logsManager.getLogsFor(payload.params[0])
    cb(null, results)
  }

  eth_subscribe (payload, cb) {
    const subscriptionId = this.vmContext.logsManager.subscribe(payload.params)
    cb(null, subscriptionId)
  }

  eth_unsubscribe (payload, cb) {
    this.vmContext.logsManager.unsubscribe(payload.params[0])
    cb(null, true)
  }

  eth_newFilter (payload, cb) {
    const filterId = this.vmContext.logsManager.newFilter('filter', payload.params[0])
    cb(null, filterId)
  }

  eth_newBlockFilter (payload, cb) {
    const filterId = this.vmContext.logsManager.newFilter('block')
    cb(null, filterId)
  }

  eth_newPendingTransactionFilter (payload, cb) {
    const filterId = this.vmContext.logsManager.newFilter('pendingTransactions')
    cb(null, filterId)
  }

  eth_uninstallfilter (payload, cb) {
    const result = this.vmContext.logsManager.uninstallFilter(payload.params[0])
    cb(null, result)
  }

  eth_getFilterChanges (payload, cb) {
    const filterId = payload.params[0]
    const results = this.vmContext.logsManager.getLogsForFilter(filterId)
    cb(null, results)
  }

  eth_getFilterLogs (payload, cb) {
    const filterId = payload.params[0]
    const results = this.vmContext.logsManager.getLogsForFilter(filterId, true)
    cb(null, results)
  }
}
