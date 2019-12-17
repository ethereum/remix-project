'use strict'
const AstWalker = require('remix-lib').AstWalker
const list = require('./modules/list')

function staticAnalysisRunner () {
}

staticAnalysisRunner.prototype.run = function (compilationResult, toRun, callback) {
  const modules = toRun.map((i) => {
    const m = this.modules()[i]
    return { 'name': m.name, 'mod': new m.Module() }
  })

  this.runWithModuleList(compilationResult, modules, callback)
}

staticAnalysisRunner.prototype.runWithModuleList = function (compilationResult, modules, callback) {
  let reports = []
  // Also provide convenience analysis via the AST walker.
  const walker = new AstWalker()
  for (let k in compilationResult.sources) {
    walker.walk(compilationResult.sources[k].legacyAST, {'*': (node) => {
      modules.map((item, i) => {
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
  reports = reports.concat(modules.map((item, i) => {
    let report = null
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
