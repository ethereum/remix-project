'use strict'
import { canUseWorker, urlFromVersion } from './compiler-utils'
import { CompilerAbstract } from './compiler-abstract'
import { Compiler } from './compiler'
import type { CompilerSettings, Language, Source } from './types'

export const compile = (compilationTargets: Source, settings: CompilerSettings, language: Language, version: string, contentResolverCallback): Promise<CompilerAbstract> => {
  return new Promise((resolve, reject) => {
    const compiler = new Compiler(contentResolverCallback)
    compiler.set('evmVersion', settings?.evmVersion)
    compiler.set('optimize', settings?.optimizer?.enabled)
    compiler.set('language', language)
    compiler.set('runs', settings?.optimizer?.runs)
    compiler.set('remappings', settings?.remappings)
    compiler.set('viaIR', settings?.viaIR)
    compiler.loadVersion(canUseWorker(version), urlFromVersion(version))
    compiler.event.register('compilationFinished', (success, compilationData, source, input, languageVersion) => {
      resolve(new CompilerAbstract(version, compilationData, source, input))
    })
    compiler.event.register('compilerLoaded', _ => compiler.compile(compilationTargets, ''))
  })
}
