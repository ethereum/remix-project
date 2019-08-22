var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext

var Filters = function (_options) {
  // const options = _options || {}
}

Filters.prototype.methods = function () {
  return {
    eth_getLogs: this.eth_getLogs.bind(this),
    eth_subscribe: this.eth_subscribe.bind(this),
    eth_unsubscribe: this.eth_unsubscribe.bind(this)
  }
}

Filters.prototype.eth_getFilterLogs = function (payload, cb) {
  let subscriptionId = payload.params[0];
  let results = executionContext.logsManager.getLogsForSubscription(subscriptionId)
  cb(null, results)
}

Filters.prototype.eth_getLogs = function (payload, cb) {
  let results = executionContext.logsManager.getLogsFor(payload.params[0])
  cb(null, results)
}

Filters.prototype.eth_subscribe = function (payload, cb) {
  let subscriptionId = executionContext.logsManager.subscribe(payload.params)
  cb(null, subscriptionId)
}

Filters.prototype.eth_unsubscribe = function (payload, cb) {
  executionContext.logsManager.unsubscribe(payload.params[0])
  cb(null, true)
}

module.exports = Filters
