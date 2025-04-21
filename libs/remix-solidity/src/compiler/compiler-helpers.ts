'use strict'
import { canUseWorker, urlFromVersion } from './compiler-utils'
import { CompilerAbstract } from './compiler-abstract'
import { Compiler } from './compiler'

export const compile = (compilationTargets, config, contentResolverCallback): Promise<CompilerAbstract> => {
  return new Promise((resolve, reject) => {
    const compiler = new Compiler(contentResolverCallback)
    compiler.set('evmVersion', config.settings?.evmVersion)
    compiler.set('optimize', config.settings?.optimizer?.enabled)
    compiler.set('language', config.language)
    compiler.set('runs', config.settings?.optimizer?.runs)
    compiler.set('remappings', config.settings?.remappings)
    compiler.set('viaIR', config.settings?.viaIR)
    compiler.loadVersion(canUseWorker(config.version), urlFromVersion(config.version))
    compiler.event.register('compilationFinished', (success, compilationData, source, input, version) => {
      resolve(new CompilerAbstract(config.version, compilationData, source, input))
    })
    compiler.event.register('compilerLoaded', _ => compiler.compile(compilationTargets, ''))
  })
}
