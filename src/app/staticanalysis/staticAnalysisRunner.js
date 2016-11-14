'use strict'
var AstWalker = require('ethereum-remix').util.AstWalker
var list = require('./modules/list')

function staticAnalysisRunner () {
}

staticAnalysisRunner.prototype.run = function (compilationResult, toRun, callback) {
  var self = this
  var modules = toRun.map(function (i) {
    var m = self.modules()[i]
    return { 'name': m.name, 'mod': new m.Module() }
  })

  // Also provide convenience analysis via the AST walker.
  var walker = new AstWalker()
  for (var k in compilationResult.sources) {
    walker.walk(compilationResult.sources[k].AST, {'*': function (node) {
      modules.map(function (item, i) {
        if (item.mod.visit !== undefined) {
          item.mod.visit(node)
        }
      })
      return true
    }})
  }

  // Here, modules can just collect the results from the AST walk,
  // but also perform new analysis.
  var reports = modules.map(function (item, i) {
    return { name: item.name, report: item.mod.report(compilationResult) }
  })
  callback(reports)
}

staticAnalysisRunner.prototype.modules = function () {
  return list
}

module.exports = staticAnalysisRunner
