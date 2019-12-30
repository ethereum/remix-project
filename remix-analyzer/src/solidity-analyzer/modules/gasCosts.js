const name = 'Gas costs: '
const desc = 'Warn if the gas requirements of functions are too high.'
const categories = require('./categories')
const algo = require('./algorithmCategories')

function gasCosts () {
}

/**
  * call the given @arg cb (function) for all the contracts. Uses last compilation result
  * stop visiting when cb return true
  * @param {Function} cb    - callback
  */
  // @TODO has been copied from remix-ide repo ! should fix that soon !
function visitContracts (contracts, cb) {
  for (let file in contracts) {
    for (let name in contracts[file]) {
      if (cb({ name: name, object: contracts[file][name], file: file })) return
    }
  }
}

gasCosts.prototype.report = function (compilationResults) {
  const report = []
  visitContracts(compilationResults.contracts, (contract) => {
    if (
      !contract.object.evm.gasEstimates ||
      !contract.object.evm.gasEstimates.external
    ) {
      return
    }
    const fallback = contract.object.evm.gasEstimates.external['']
    if (fallback !== undefined) {
      if (fallback === null || fallback >= 2100 || fallback === 'infinite') {
        report.push({
          warning: `Fallback function of contract ${contract.name} requires too much gas (${fallback}). 
          If the fallback function requires more than 2300 gas, the contract cannot receive Ether.`
        })
      }
    }

    for (var functionName in contract.object.evm.gasEstimates.external) {
      if (functionName === '') {
        continue
      }
      const gas = contract.object.evm.gasEstimates.external[functionName]
      const gasString = gas === null ? 'unknown or not constant' : 'high: ' + gas
      if (gas === null || gas >= 3000000 || gas === 'infinite') {
        report.push({
          warning: `Gas requirement of function ${contract.name}.${functionName} ${gasString}. 
          If the gas requirement of a function is higher than the block gas limit, it cannot be executed.
          Please avoid loops in your functions or actions that modify large areas of storage
          (this includes clearing or copying arrays in storage)`
        })
      }
    }
  })
  return report
}

module.exports = {
  name: name,
  description: desc,
  category: categories.GAS,
  algorithm: algo.EXACT,
  Module: gasCosts
}
