const EventEmitter = require('events')

/*
  Checks if any child elements of journal (console) contains a matching value.
*/
class testTransactionLog extends EventEmitter {
  command (txHash, expectedValue) {
    const browser = this.api;
    browser.perform(() => {
      const result = parseTransactionLog(this.api, txHash)

      this.emit('complete')
    })
    return this
  }
}

function parseTransactionLog(browser, txHash){
  const logs = { 
    status: '',
    'transaction hash': '',
    'contract address': '',
    from: '',
    to: '',
    gas: '',
    'transaction cost': '',
    'execution cost': '',
    hash: '',
    input: '',
    'decoded input': '',
    'decoded output': '',
    logs: '',
    value: '' 
  }
  
  browser.waitForElementVisible('txLoggerTable'+txHash)
  .getText(`*[data-id="txLoggerTableStatus${txHash}"]`, (result) =>  logs.status = result)
  .getText(`*[data-id="txLoggerTableTransactionHash${txHash}"]`, (result) =>  logs['transaction hash'] = result)
  .getText(`*[data-id="txLoggerTableContractAddress${txHash}"]`, (result) =>  logs['contract address'] = result)
  .getText(`*[data-id="txLoggerTableFrom${txHash}"]`, (result) =>  logs.from = result)
  .getText(`*[data-id="txLoggerTableTo${txHash}"]`, (result) =>  logs.to = result)
  .getText(`*[data-id="txLoggerTableGas${txHash}"]`, (result) =>  logs.gas = result)
  .getText(`*[data-id="txLoggerTableTransactionCost${txHash}"]`, (result) =>  logs['transaction cost'] = result)
  .getText(`*[data-id="txLoggerTableExecutionCost${txHash}"]`, (result) =>  logs['execution cost'] = result)
  .getText(`*[data-id="txLoggerTableHash${txHash}"]`, (result) =>  logs.hash = result)
  .getText(`*[data-id="txLoggerTableInput${txHash}"]`, (result) =>  logs.input = result)
  .getText(`*[data-id="txLoggerTableDecodedInput${txHash}"]`, (result) =>  logs['decoded input'] = result)
  .getText(`*[data-id="txLoggerTableDecodedOutput${txHash}"]`, (result) =>  logs['decoded output'] = result)
  .getText(`*[data-id="txLoggerTableDecodedLogs${txHash}"]`, (result) =>  logs.logs = result)
  .getText(`*[data-id="txLoggerTableDecodedLogs${txHash}"]`, (result) =>  logs.value = result)

  return logs;
}

module.exports = testFunction