var name = 'Selfdestruct: '
var desc = 'Be aware of caller contracts.'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')

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
      warning: 'Use of selfdestruct: can block calling contracts unexpectedly. Be especially careful if this contract is planned to be used by other contracts (i.e. library contracts, interactions). Selfdestruction of the callee contract can leave callers in an inoperable state.',
      location: item.src,
      more: 'https://paritytech.io/blog/security-alert.html'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.SECURITY,
  Module: selfdestruct
}
