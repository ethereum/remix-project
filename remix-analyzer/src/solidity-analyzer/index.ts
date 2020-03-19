'use strict'
import { AstWalker } from 'remix-astwalker'
import list from './modules/list'
import { CompilationResult, AnalyzerModule, AnalysisReportObj, AnalysisReport } from 'types'

type ModuleObj = {
  name: string
  mod: AnalyzerModule
}

export default class staticAnalysisRunner {

  run (compilationResult: CompilationResult, toRun: any[], callback: ((reports: AnalysisReport[]) => void)): void {
    const modules: ModuleObj[] = toRun.map((i) => {
      const m: AnalyzerModule = this.modules()[i]
      return { 'name': m.name, 'mod': m }
    })
    this.runWithModuleList(compilationResult, modules, callback)
  }

  runWithModuleList (compilationResult: CompilationResult, modules: ModuleObj[], callback: ((reports: AnalysisReport[]) => void)): void {
    let reports: AnalysisReport[] = []
    // Also provide convenience analysis via the AST walker.
    const walker: AstWalker = new AstWalker()
    for (let k in compilationResult.sources) {
      walker.walkFull(compilationResult.sources[k].ast, 
        (node: any) => {
        modules.map((item: ModuleObj) => {
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
    reports = reports.concat(modules.map((item: ModuleObj) => {
      let report: AnalysisReportObj[] | null = null
      try {
        report = item.mod.report(compilationResult)
      } catch (e) {
        report = [{ warning: 'INTERNAL ERROR in module ' + item.name + ' ' + e.message, error: e.stack }]
      }
      return { name: item.name, report: report }
    }))
    callback(reports)
  }

  modules (): any[] {
    return list
  }
}
