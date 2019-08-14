const async = require('async')
const crypto = require('crypto')

class LogsManager {

  constructor() {
    this.notificationCallbacks = []
    this.subscriptions = {}
  }

  checkBlock(blockNumber, block, web3) {
    async.eachOf(block.transactions, (tx, i, next) => {
      let txHash = "0x" + tx.hash().toString('hex')

      let subscriptions = this.getSubscriptionsFor({ type: 'block', block: block, tx: tx })

      // console.dir("====================================================")
      // console.dir(block)
      // console.dir("====================================================")

      web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
        console.dir("====================================================")
        console.dir("====================================================")
        console.dir("====================================================")
        console.dir(receipt)
        // web3.eth.abi.decodeLog(inputs_abi, receipt.logs[0].data, receipt.logs[0].topics)
        // console.dir(process.exit(0))
        //     // web3.eth.abi.decodeLog(inputs_abi, receipt.logs[0].data, receipt.logs[0].topics)

        for (let log of receipt.logs) {
          for (let subscriptionId of subscriptions) {
            let result = {
              "logIndex": "0x1", // 1
              // "blockNumber": ("0x" + blockNumber),
              "blockNumber": blockNumber,
              "blockHash": ('0x' + block.hash().toString('hex')),
              "transactionHash": ('0x' + tx.hash().toString('hex')),
              "transactionIndex": "0x" + i.toString(16),
              // TODO: if it's a contract deploy, it should be that address instead
              // "address": ('0x' + tx.to.toString('hex')),
              "address": log.address,
              // "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
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

  // TODO:
  // * need to get address of deployed contract if it's a tx that create a contract
  getSubscriptionsFor(changeEvent) {
    let matchedSubscriptions = []
    for (let subscriptionId of Object.keys(this.subscriptions)) {
      const subscriptionParams = this.subscriptions[subscriptionId]
      const [queryType, queryFilter] = subscriptionParams
      if (queryType === 'logs') {
        if (queryFilter.address === changeEvent.tx.toJSON().to) {
          matchedSubscriptions.push(subscriptionId)
        }
        if (queryFilter.address === ('0x' + changeEvent.tx.from.toString('hex'))) {
          matchedSubscriptions.push(subscriptionId)
        }
      }

      console.dir("-----------------------> ")
      console.dir(subscriptionParams)

      matchedSubscriptions.push(subscriptionId)
    }
    return matchedSubscriptions;
  }

  transmit(result) {
    console.dir("-----------------")
    console.dir("---- transmit")
    console.dir(this.notificationCallbacks)
    console.dir(result)

    // TODO: manage subscriptions

    this.notificationCallbacks.forEach((callback) => {
      callback(result)
    });
  }

  addListener(type, cb) {
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
    let results = [{
      "logIndex": "0x1", // 1
      "blockNumber": "0x1b4", // 436
      "blockHash": "0x8216c5785ac562ff41e2dcfdf5785ac562ff41e2dcfdf829c5a142f1fccd7d",
      "transactionHash": "0xdf829c5a142f1fccd7d8216c5785ac562ff41e2dcfdf5785ac562ff41e2dcf",
      "transactionIndex": "0x0", // 0
      "address": "0x16c5785ac562ff41e2dcfdf829c5a142f1fccd7d",
      "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "topics": ["0x59ebeb90bc63057b6515673c3ecf9438e5058bca0f92585014eced636878c9a5"]
    }]

    return results
  }

}

module.exports = LogsManager;