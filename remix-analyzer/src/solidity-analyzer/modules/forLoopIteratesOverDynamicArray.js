var name = 'For loop iterates over dynamic array: '
var desc = 'The number of \'for\' loop iterations depends on dynamic array\'s size'
var categories = require('./categories')
var common = require('./staticAnalysisCommon')

function forLoopIteratesOverDynamicArray () {
  this.relevantNodes = []
}

forLoopIteratesOverDynamicArray.prototype.visit = function (node) {
  if (common.isForLoop(node) &&
    node.children[1].children[1].attributes.member_name === 'length' &&
    node.children[1].children[1].children[0].attributes.type.indexOf('[]') !== -1) {
    this.relevantNodes.push(node)
  }
}

forLoopIteratesOverDynamicArray.prototype.report = function (compilationResults) {
  return this.relevantNodes.map((node) => {
    return {
      warning: 'Loops that do not have a fixed number of iterations, for example, loops that depend on storage values, have to be used carefully: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. Additionally, using unbounded loops incurs in a lot of avoidable gas costs. Carefully test how many items at maximum you can pass to such functions to make it successful.',
      location: node.src,
      more: 'http://solidity.readthedocs.io/en/v0.4.24/security-considerations.html#gas-limit-and-loops'
    }
  })
}

module.exports = {
  name: name,
  description: desc,
  category: categories.GAS,
  Module: forLoopIteratesOverDynamicArray
}
