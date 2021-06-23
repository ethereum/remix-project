'use strict'
import { compilation } from '@remix-project/remix-lib'
import { Compiler } from '@remix-project/remix-solidity'
import CompilerAbstract from './compiler-abstract'
const { canUseWorker, urlFromVersion } = compilation
export const compile = async (compilationTargets, settings, contentResolverCallback) => {
  const res = await (() => {
    return new Promise((resolve, reject) => {
      const compiler = new Compiler(contentResolverCallback)
      compiler.set('evmVersion', settings.evmVersion)
      compiler.set('optimize', settings.optimize)
      compiler.set('language', settings.language)
      compiler.set('runs', settings.runs)
      compiler.loadVersion(canUseWorker(settings.version), urlFromVersion(settings.version))
      compiler.event.register('compilationFinished', (success, compilationData, source) => {
        resolve(new CompilerAbstract(settings.version, compilationData, source))
      })
      compiler.event.register('compilerLoaded', _ => compiler.compile(compilationTargets, ''))
    })
  })()
  return res
}
