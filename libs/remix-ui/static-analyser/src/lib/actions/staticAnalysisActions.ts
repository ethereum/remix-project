import React from 'react' //eslint-disable-line

export const compilation = (analysisModule, dispatch) => {
  if (analysisModule) {
    analysisModule.on(
      'solidity',
      'compilationFinished',
      (file, source, languageVersion, data, input, version) => {
        if (languageVersion.indexOf('soljson') !== 0) return
        dispatch({ type: 'compilationFinished', payload: { file, source, languageVersion, data, input, version } })
      }
    )
  }
}
