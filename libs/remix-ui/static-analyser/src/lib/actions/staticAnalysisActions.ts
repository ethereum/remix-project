import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'
import React from 'react' //eslint-disable-line
import { AnalysisTab, RemixUiStaticAnalyserReducerActionType } from '../../staticanalyser'

/**
 * 
 * @param analysisModule { AnalysisTab } AnalysisTab ViewPlugin
 * @param dispatch { React.Dispatch<any> } analysisReducer function's dispatch method
 */
export const compilation = (analysisModule: AnalysisTab,
  dispatch: React.Dispatch<RemixUiStaticAnalyserReducerActionType>) => {
  if (analysisModule) {
    analysisModule.on(
      'solidity',
      'compilationFinished',
      (file: string, source: SourceWithTarget, languageVersion: string, data: CompilationResult, input: string, version: string) => {
        if (languageVersion.indexOf('soljson') !== 0) return
        dispatch({ type: 'compilationFinished', payload: { file, source, languageVersion, data, input, version } })
      }
    )
  }
}
