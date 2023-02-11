import { CompilationResult, CompilationFileSources, lastCompilationResult, CondensedCompilationInput, SourcesInput } from './type'
import { StatusEvents, Api } from '@remixproject/plugin-utils'

export interface ICompiler extends Api {
  events: {
    compilationFinished: (
      fileName: string,
      source: CompilationFileSources,
      languageVersion: string,
      data: CompilationResult
    ) => void
  } & StatusEvents
  methods: {
    getCompilationResult(): lastCompilationResult
    compile(fileName: string): void
    setCompilerConfig(settings: CondensedCompilationInput): void
    compileWithParameters(targets: SourcesInput, settings: CondensedCompilationInput): lastCompilationResult
  }
}
