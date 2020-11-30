const async = require('async')
const crypto = require('crypto')

class LogsManager {

  constructor () {
    this.notificationCallbacks = []
    this.subscriptions = {}
    this.filters = {}
    this.filterTracking = {}
    this.oldLogs = []
  }

  checkBlock (blockNumber, block, web3) {
    async.eachOf(block.transactions, (tx, i, next) => {
      let txHash = '0x' + tx.hash().toString('hex')

      web3.eth.getTransactionReceipt(txHash, (_error, receipt) => {
        for (let log of receipt.logs) {
          this.oldLogs.push({ type: 'block', blockNumber, block, tx, log, txNumber: i })
          let subscriptions = this.getSubscriptionsFor({ type: 'block', blockNumber, block, tx, log })

          for (let subscriptionId of subscriptions) {
            let result = {
              'logIndex': '0x1', // 1
              'blockNumber': blockNumber,
              'blockHash': ('0x' + block.hash().toString('hex')),
              'transactionHash': ('0x' + tx.hash().toString('hex')),
              'transactionIndex': '0x' + i.toString(16),
              // TODO: if it's a contract deploy, it should be that address instead
              'address': log.address,
              'data': log.data,
              'topics': log.topics
            }

            if (result.address === '0x') {
              delete result.address
            }

            let response = { 'jsonrpc': '2.0', 'method': 'eth_subscription', params: { 'result': result, 'subscription': subscriptionId } }
            this.transmit(response)
          }
        }
      })
    }, (_err) => {
    })
  }

  eventMatchesFilter (changeEvent, queryType, queryFilter) {
    if (queryFilter.topics.filter((logTopic) => changeEvent.log.topics.indexOf(logTopic) >= 0).length === 0) return false

    if (queryType === 'logs') {
      if ((queryFilter.address === ('0x' + changeEvent.tx.to.toString('hex'))) && (queryFilter.address === ('0x' + changeEvent.tx.from.toString('hex')))) {
        if (!queryFilter.toBlock) {
          return true
        } else if (parseInt(queryFilter.toBlock) > parseInt(changeEvent.blockNumber)) {
          return true
        }
      }
    }

    return false
  }

  getSubscriptionsFor (changeEvent) {
    let matchedSubscriptions = []
    for (let subscriptionId of Object.keys(this.subscriptions)) {
      const subscriptionParams = this.subscriptions[subscriptionId]
      const [queryType, queryFilter] = subscriptionParams

      if (this.eventMatchesFilter(changeEvent, queryType, queryFilter || {topics: []})) {
        matchedSubscriptions.push(subscriptionId)
      }
    }
    return matchedSubscriptions
  }

  getLogsForSubscription (subscriptionId) {
    const subscriptionParams = this.subscriptions[subscriptionId]
    const [_queryType, queryFilter] = subscriptionParams // eslint-disable-line

    return this.getLogsFor(queryFilter)
  }

  transmit (result) {
    this.notificationCallbacks.forEach((callback) => {
      if (result.params.result.raw) {
        result.params.result.data = result.params.result.raw.data
        result.params.result.topics = result.params.result.raw.topics
      }
      callback(result)
    })
  }

  addListener (_type, cb) {
    this.notificationCallbacks.push(cb)
  }

  subscribe (params) {
    let subscriptionId = '0x' + crypto.randomBytes(16).toString('hex')
    this.subscriptions[subscriptionId] = params
    return subscriptionId
  }

  unsubscribe (subscriptionId) {
    delete this.subscriptions[subscriptionId]
  }

  newFilter (filterType, params) {
    const filterId = '0x' + crypto.randomBytes(16).toString('hex')
    if (filterType === 'block' || filterType === 'pendingTransactions') {
      this.filters[filterId] = { filterType }
    }
    if (filterType === 'filter') {
      this.filters[filterId] = { filterType, params }
    }
    this.filterTracking[filterId] = {}
    return filterId
  }

  uninstallFilter (filterId) {
    delete this.filters[filterId]
  }

  getLogsForFilter (filterId, logsOnly) {
    const {filterType, params} = this.filter[filterId]
    const tracking = this.filterTracking[filterId]

    if (logsOnly || filterType === 'filter') {
      return this.getLogsFor(params || {topics: []})
    }
    if (filterType === 'block') {
      let blocks = this.oldLogs.filter(x => x.type === 'block').filter(x => tracking.block === undefined || x.blockNumber >= tracking.block)
      tracking.block = blocks[blocks.length - 1]
      return blocks.map(block => ('0x' + block.hash().toString('hex')))
    }
    if (filterType === 'pendingTransactions') {
      return []
    }
  }

  getLogsFor (params) {
    let results = []
    for (let log of this.oldLogs) {
      if (this.eventMatchesFilter(log, 'logs', params)) {
        results.push({
          'logIndex': '0x1', // 1
          'blockNumber': log.blockNumber,
          'blockHash': ('0x' + log.block.hash().toString('hex')),
          'transactionHash': ('0x' + log.tx.hash().toString('hex')),
          'transactionIndex': '0x' + log.txNumber.toString(16),
          // TODO: if it's a contract deploy, it should be that address instead
          'address': log.log.address,
          'data': log.log.data,
          'topics': log.log.topics
        })
      }
    }

    return results
  }

}

module.exports = LogsManager
