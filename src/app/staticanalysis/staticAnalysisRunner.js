'use strict'
var AstWalker = require('ethereum-remix').util.AstWalker
var list = require('./modules/list')

function staticAnalysisRunner () {
}

staticAnalysisRunner.prototype.run = function (ast, toRun, callback) {
  var walker = new AstWalker()
  for (var k in ast) {
    walker.walk(ast[k].AST, {'*': function (node) {
      toRun.map(function (item, i) {
        item.visit(node)
      })
      return true
    }})
  }

  var reports = []
  toRun.map(function (item, i) {
    reports.push(item.report())
  })
  callback(reports)
}

staticAnalysisRunner.prototype.modules = function () {
  return list
}

module.exports = staticAnalysisRunner
