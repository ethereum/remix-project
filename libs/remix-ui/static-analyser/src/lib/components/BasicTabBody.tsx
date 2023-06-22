import React from 'react'
import ErrorRenderer from "../ErrorRenderer"

type BasicTabBodyProps = {
  state: any
  hideWarnings: boolean
  showLibsWarning: boolean
  warningState: any
  ssaWarnings: any[]
  ssaWarningsNoLibs: any[]
  startAnalysis: boolean
  analysisModule: any
}
export function BasicTabBody({ state, hideWarnings, ssaWarnings, ssaWarningsNoLibs, showLibsWarning, warningState, startAnalysis, analysisModule}: BasicTabBodyProps) {

  return (
    <>
      {ssaWarningsNoLibs.length > 0 ? (
        <div id="staticanalysisresult">
          <div className="mb-4 pt-2">
            {
              (hideWarnings === false && showLibsWarning === false) && ssaWarningsNoLibs.length > 0
                ? ssaWarningsNoLibs.filter(x => x.options.isLibrary === false).map((item, index) => (
                  <div
                    data-id={`staticAnalysisModule${item.warningModuleName}${index}`}
                    id={`staticAnalysisModule${item.warningModuleName}${index}`}
                    key={index}
                  >
                    <ErrorRenderer
                      name={`staticAnalysisModule${item.warningModuleName}${index}`}
                      message={item.msg}
                      opt={item.options}
                      warningErrors={''}
                      editor={analysisModule}
                    />
                  </div>
                ))
              : null
            }
            {
                hideWarnings === false && showLibsWarning === true && ssaWarnings.length > 0
                ? ssaWarnings.map((warning, index) => (
                  <div
                    data-id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                    id={`staticAnalysisModule${warning.warningModuleName}${index}`}
                    key={index}
                  >
                    <ErrorRenderer
                      name={`staticAnalysisModule${warning.warningModuleName}${index}`}
                      message={warning.msg}
                      opt={warning.options}
                      warningErrors={''}
                      editor={analysisModule}
                    />
                  </div>
                )) : null
            }
          </div>
        </div>
      ) : state.data &&
        state.file.length > 0 &&
        state.source &&
        startAnalysis &&
        Object.entries(warningState).length > 0 ? (
        <span className="ml-4 spinner-grow-sm d-flex justify-content-center">
          Loading...
        </span>
      ) : (
        <span className="display-6 text-center">Nothing to report</span>
      )}
    </>
  );
}
