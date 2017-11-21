var name = 'Selfdestruct: '
var desc = 'Be aware of caller contracts.'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')
var yo = require('yo-yo')

function selfdestruct () {
  this.relevantNodes = []
}

selfdestruct.prototype.visit = function (node) {
  if (common.isSelfdestructCall(node)) {
    this.relevantNodes.push(node)
  }
}

selfdestruct.prototype.report = function () {
  return this.relevantNodes.map(function (item, i) {
    return {
      warning: yo`<span>Use of selfdestruct: can block calling contracts unexpectedly<br />
                Please, be especially carefull if this contract is referenced by other contracts (i.e. library contracts, interactions). Selfdestruction of called contracts can render callers inoperable.</span>`,
      location: item.src,
      more: 'https://www.coindesk.com/ethereum-client-bug-freezes-user-funds-fallout-remains-uncertain/'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  Module: selfdestruct
}
