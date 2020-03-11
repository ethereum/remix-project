'use strict'
import { AstWalker } from 'remix-astwalker'
import list from './modules/list'

export default class staticAnalysisRunner {

  run (compilationResult, toRun, callback) {
    const modules = toRun.map((i) => {
      const m = this.modules()[i]
      return { 'name': m.name, 'mod': m }
    })

    this.runWithModuleList(compilationResult, modules, callback)
  }

  runWithModuleList (compilationResult, modules, callback) {
    let reports: any[] = []
    // Also provide convenience analysis via the AST walker.
    const walker = new AstWalker()
    for (let k in compilationResult.sources) {
      // console.log('Ast in walker---', compilationResult.sources[k])
      walker.walkFull(compilationResult.sources[k].ast, 
        (node) => {
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
      }
      )
    }

    // Here, modules can just collect the results from the AST walk,
    // but also perform new analysis.
    reports = reports.concat(modules.map((item, i) => {
      let report: any = null
      try {
        report = item.mod.report(compilationResult)
      } catch (e) {
        report = [{ warning: 'INTERNAL ERROR in module ' + item.name + ' ' + e.message, error: e.stack }]
      }
      return { name: item.name, report: report }
    }))
    callback(reports)
  }

  modules () {
    return list
  }
}
