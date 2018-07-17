'use strict'
var AstWalker = require('remix-lib').AstWalker
var list = require('./modules/list')

function staticAnalysisRunner () {
}

staticAnalysisRunner.prototype.run = function (compilationResult, toRun, callback) {
  var self = this
  var modules = toRun.map(function (i) {
    var m = self.modules()[i]
    return { 'name': m.name, 'mod': new m.Module() }
  })

  this.runWithModuleList(compilationResult, modules, callback)
}

staticAnalysisRunner.prototype.runWithModuleList = function (compilationResult, modules, callback) {
  var reports = []
  // Also provide convenience analysis via the AST walker.
  var walker = new AstWalker()
  for (var k in compilationResult.sources) {
    walker.walk(compilationResult.sources[k].legacyAST, {'*': function (node) {
      modules.map(function (item, i) {
        if (item.mod.visit !== undefined) {
          try {
            item.mod.visit(node)
          } catch (e) {
            reports.push({
              name: item.name, report: [{ warning: 'INTERNAL ERROR in module ' + item.name + ' ' + e.message, error: e.stack }]
            })
          }
        }
      })
      return true
    }})
  }

  // Here, modules can just collect the results from the AST walk,
  // but also perform new analysis.
  reports = reports.concat(modules.map(function (item, i) {
    var report = null
    try {
      report = item.mod.report(compilationResult)
    } catch (e) {
      report = [{ warning: 'INTERNAL ERROR in module ' + item.name + ' ' + e.message, error: e.stack }]
    }
    return { name: item.name, report: report }
  }))
  callback(reports)
}

staticAnalysisRunner.prototype.modules = function () {
  return list
}

module.exports = staticAnalysisRunner
