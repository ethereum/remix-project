var executionContext = require('../execution-context')
window.executionContext = executionContext
module.exports = detectNetwork

function detectNetwork (callback) {
  var web3provider = executionContext.web3()
  var get = web3provider.version ? web3provider.version.getNetwork : web3provider.web3.version.getNetwork
  get((err, id) => {
    var name = null
    if (err) name = 'Unknown'
    else if (id === '1') name = 'Main'
    else if (id === '2') name = 'Morden (deprecated)'
    else if (id === '3') name = 'Ropsten'
    else if (id === '4') name = 'Rinkeby'
    else if (id === '42') name = 'Kovan'
    else name = 'Unknown'
    callback(err, { id, name })
  })
}
