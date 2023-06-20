import React from 'react'
import ErrorRenderer from "../ErrorRenderer"

type BasicTabBodyProps = {
  state: any
  hideWarnings: boolean
  showLibsWarning: boolean
  warningState: any
  startAnalysis: boolean
  analysisModule: any
}
export function BasicTabBody({ state, hideWarnings, showLibsWarning, warningState, startAnalysis, analysisModule}: BasicTabBodyProps) {

  return (
    <>
          {Object.entries(warningState).length > 0 ? (
            <div id="staticanalysisresult">
              <div className="mb-4 pt-2">
                {Object.entries(warningState).map((element, index) => (
                  <div key={index}>
                    { hideWarnings === false ? <span className="text-dark h6">{element[0]}</span> : null}
                    { hideWarnings === false ? element[1]["map"](
                      (x,i) => // eslint-disable-line dot-notation
                        x.hasWarning
                        ? ( // eslint-disable-next-line  dot-notation
                          <div
                            data-id={`staticAnalysisModule${x.warningModuleName}${i}`}
                            id={`staticAnalysisModule${x.warningModuleName}${i}`}
                            key={i}
                          >
                            <ErrorRenderer
                              name={`staticAnalysisModule${x.warningModuleName}${i}`}
                              message={x.msg}
                              opt={x.options}
                              warningErrors={x.warningErrors}
                              editor={analysisModule}
                            />
                          </div>
                        ) : null
                    ) : element[1]["map"](
                      (x,i) => // eslint-disable-line dot-notation
                        showLibsWarning && x.isLibrary
                        ? ( // eslint-disable-next-line  dot-notation
                          <div
                            data-id={`staticAnalysisModule${x.warningModuleName}${i}`}
                            id={`staticAnalysisModule${x.warningModuleName}${i}`}
                            key={i}
                          >
                            <ErrorRenderer
                              name={`staticAnalysisModule${x.warningModuleName}${i}`}
                              message={x.msg}
                              opt={x.options}
                              warningErrors={x.warningErrors}
                              editor={analysisModule}
                            />
                          </div>
                        ) : null)}
                    {}
                  </div>
                ))}
              </div>
            </div>
          ) : state.data && state.file.length > 0 && state.source && startAnalysis && Object.entries(warningState).length > 0 ? <span className="ml-4 spinner-grow-sm d-flex justify-content-center">Loading...</span> : <span className="display-6 text-center">Nothing to report</span>}
        </>
  )
}
