
const Filters = function (executionContext) {
  this.executionContext = executionContext
}

Filters.prototype.methods = function () {
  return {
    eth_getLogs: this.eth_getLogs.bind(this),
    eth_subscribe: this.eth_subscribe.bind(this),
    eth_unsubscribe: this.eth_unsubscribe.bind(this)
  }
}

Filters.prototype.eth_getLogs = function (payload, cb) {
  let results = this.executionContext.logsManager.getLogsFor(payload.params[0])
  cb(null, results)
}

Filters.prototype.eth_subscribe = function (payload, cb) {
  let subscriptionId = this.executionContext.logsManager.subscribe(payload.params)
  cb(null, subscriptionId)
}

Filters.prototype.eth_unsubscribe = function (payload, cb) {
  this.executionContext.logsManager.unsubscribe(payload.params[0])
  cb(null, true)
}

Filters.prototype.eth_newFilter = function (payload, cb) {
  const filterId = this.executionContext.logsManager.newFilter('filter', payload.params[0])
  cb(null, filterId)
}

Filters.prototype.eth_newBlockFilter = function (payload, cb) {
  const filterId = this.executionContext.logsManager.newFilter('block')
  cb(null, filterId)
}

Filters.prototype.eth_newPendingTransactionFilter = function (payload, cb) {
  const filterId = this.executionContext.logsManager.newFilter('pendingTransactions')
  cb(null, filterId)
}

Filters.prototype.eth_uninstallfilter = function (payload, cb) {
  const result = this.executionContext.logsManager.uninstallFilter(payload.params[0])
  cb(null, result)
}

Filters.prototype.eth_getFilterChanges = function (payload, cb) {
  const filterId = payload.params[0]
  let results = this.executionContext.logsManager.getLogsForFilter(filterId)
  cb(null, results)
}

Filters.prototype.eth_getFilterLogs = function (payload, cb) {
  const filterId = payload.params[0]
  let results = this.executionContext.logsManager.getLogsForFilter(filterId, true)
  cb(null, results)
}

module.exports = Filters
