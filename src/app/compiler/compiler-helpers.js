'use strict'
import { canUseWorker, urlFromVersion } from './compiler-utils'
import { Compiler } from 'remix-solidity'
import CompilerAbstract from './compiler-abstract'

export const compile = async (compilationTargets, settings) => {
  return await (() => {
    return new Promise((resolve, reject) => {
      const compiler = new Compiler(() => {})
      compiler.set('evmVersion', settings.evmVersion)
      compiler.set('optimize', settings.optimize)
      compiler.set('language', settings.language)
      compiler.loadVersion(canUseWorker(settings.version), urlFromVersion(settings.version))
      compiler.event.register('compilationFinished', (success, compilationData, source) => {
        console.log(success, compilationData)
        if (!success) return reject(compilationData)
        resolve(new CompilerAbstract(settings.version, compilationData, source))
      })
      compiler.event.register('compilerLoaded', _ => compiler.compile(compilationTargets, ''))
    })
  })()
}
