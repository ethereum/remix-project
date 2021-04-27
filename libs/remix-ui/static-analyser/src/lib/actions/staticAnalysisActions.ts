import React, { useState } from 'react' //eslint-disable-line

export const compilation = (analysisModule, state, run) => {
//   const setCompilationResult = async (data, source, file) => {
//     await setResult({ lastCompilationResult: data, lastCompilationSource: source, currentFile: file })
//   }
  if (analysisModule) {
    analysisModule.on(
      'solidity',
      'compilationFinished',
      (file, source, languageVersion, data) => {
        if (languageVersion.indexOf('soljson') !== 0) return
        setCompilationResult(data, source, file)
        if (state.categoryIndex.length > 0) {
          run(data, source, file)
        }
      }
    )
  }
}

export const setCompilationResult = async (data, source, file) => {
  return await { data, source, file }
}
