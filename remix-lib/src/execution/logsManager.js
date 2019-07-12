var crypto = require('crypto')

class LogsManager {

  constructor() {
    this.notificationCallbacks = []
    this.subscriptions = {}
  }

  checkBlock(blockNumber, block) {
    let subscriptionId = Object.keys(this.subscriptions)[0];

    let result = {
      "logIndex": "0x1", // 1
      "blockNumber": "0x1b4", // 436
      "blockHash": "0x8216c5785ac562ff41e2dcfdf5785ac562ff41e2dcfdf829c5a142f1fccd7d",
      "transactionHash": "0xdf829c5a142f1fccd7d8216c5785ac562ff41e2dcfdf5785ac562ff41e2dcf",
      "transactionIndex": "0x0", // 0
      "address": "0x16c5785ac562ff41e2dcfdf829c5a142f1fccd7d",
      "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "topics": ["0x59ebeb90bc63057b6515673c3ecf9438e5058bca0f92585014eced636878c9a5"]
    }

    let response = { 'jsonrpc': '2.0', "method": "eth_subscription", params: { 'result': result, 'subscription': subscriptionId } };
    this.transmit(response);
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