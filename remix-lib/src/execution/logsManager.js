const async = require('async')
const crypto = require('crypto')

class LogsManager {

  constructor() {
    this.notificationCallbacks = []
    this.subscriptions = {}
    this.oldLogs = []
  }

  checkBlock(blockNumber, block, web3) {
    async.eachOf(block.transactions, (tx, i, next) => {
      let txHash = "0x" + tx.hash().toString('hex')

      web3.eth.getTransactionReceipt(txHash, (_error, receipt) => {
        for (let log of receipt.logs) {
          this.oldLogs.push({ type: 'block', blockNumber, block, tx, log, txNumber: i })
          let subscriptions = this.getSubscriptionsFor({ type: 'block', blockNumber, block, tx, log })

          for (let subscriptionId of subscriptions) {
            let result = {
              "logIndex": "0x1", // 1
              "blockNumber": blockNumber,
              "blockHash": ('0x' + block.hash().toString('hex')),
              "transactionHash": ('0x' + tx.hash().toString('hex')),
              "transactionIndex": "0x" + i.toString(16),
              // TODO: if it's a contract deploy, it should be that address instead
              "address": log.address,
              "data": log.data,
              "topics": log.topics,
            }

            if (result.address === "0x") {
              delete result.address
            }

            let response = { 'jsonrpc': '2.0', "method": "eth_subscription", params: { 'result': result, 'subscription': subscriptionId } };
            this.transmit(response);
          }
        }
      })
    }, (err) => {
    });
  }

  eventMatchesFilter(changeEvent, queryType, queryFilter) {
    console.dir("--> matching topics")
    if (queryFilter.topics.filter((logTopic) => changeEvent.log.topics.indexOf(logTopic) >= 0).length === 0) return false
    console.dir("topic matched")

    if (queryType === 'logs') {
      if ((queryFilter.address === ("0x" + changeEvent.tx.to.toString('hex')))
        && (queryFilter.address === ('0x' + changeEvent.tx.from.toString('hex')))) {
        if (!queryFilter.toBlock) {
          return true;
        } else if (parseInt(queryFilter.toBlock) > parseInt(changeEvent.blockNumber)) {
          return true;
        }
      }
    }

    return false;
  }

  // TODO:
  // * need to get address of deployed contract if it's a tx that create a contract
  getSubscriptionsFor(changeEvent) {
    let matchedSubscriptions = []
    for (let subscriptionId of Object.keys(this.subscriptions)) {
      const subscriptionParams = this.subscriptions[subscriptionId]
      const [queryType, queryFilter] = subscriptionParams

      if (this.eventMatchesFilter(changeEvent, queryType, queryFilter)) {
        matchedSubscriptions.push(subscriptionId)
      }
    }
    return matchedSubscriptions;
  }

  transmit(result) {
    console.dir("-----------------")
    console.dir("---- transmit")
    console.dir(this.notificationCallbacks)
    console.dir(result)

    // TODO: manage subscriptions
    // need to associate subscriptions to notificationCallbacks

    this.notificationCallbacks.forEach((callback) => {
      if (result.params.result.raw) {
        result.params.result.data = result.params.result.raw.data
        result.params.result.topics = result.params.result.raw.topics
      }
      console.dir("transmitting back")
      console.dir(result)
      // console.dir(result.params.result.returnValues)
      // console.dir(result.params.result.raw)
      callback(result)
    });
  }

  addListener(type, cb) {
    console.dir("<<<<<<<<<<<------------------------->>>>>>>>>>>>>");
    console.dir("adding listener...");
    this.notificationCallbacks.push(cb)
    console.dir("--------------------------------------------------------->")
    console.dir("==========================")
    console.dir("==========================")
    console.dir(this.notificationCallbacks)
    console.dir("==========================")
    console.dir("==========================")
  }

  subscribe(params) {
    let subscriptionId = "0x" + crypto.randomBytes(16).toString('hex')
    this.subscriptions[subscriptionId] = params
    return subscriptionId
  }

  unsubscribe(subscriptionId) {
    delete this.subscriptions[subscriptionId]
  }

  getLogsFor(params) {
    let results = []
    for (let log of this.oldLogs) {
      if (this.eventMatchesFilter(log, 'logs', params)) {
        results.push({
          "logIndex": "0x1", // 1
          "blockNumber": log.blockNumber,
          "blockHash": ('0x' + log.block.hash().toString('hex')),
          "transactionHash": ('0x' + log.tx.hash().toString('hex')),
          "transactionIndex": "0x" + logs.txNumber.toString(16),
          // TODO: if it's a contract deploy, it should be that address instead
          "address": log.log.address,
          "data": log.log.data,
          "topics": log.log.topics,
        })
      }
    }

    return results
  }

}

module.exports = LogsManager;