import React, { useEffect, useState } from "react"
import { SolHintTabChildProps } from "../../staticanalyser"
import ErrorRenderer from "../ErrorRenderer"



export default function SolHintTabChild(props: SolHintTabChildProps) {
  const [hints, setHints] = useState([])
  console.log({ hints })
  
  useEffect(() => {
      props.analysisModule.on('solidity', 'compilationFinished',
        async (fileName, source, languageVersion, data) => {
          const hints = await props.analysisModule.call('solhint', 'lint', fileName)
          setHints(prev => [...prev, ...hints])
      })
  }, [])
  return (
    <>
    {hints.length > 0 &&
        <div id='solhintlintingresult' >
          <div className="mb-4">
            {
              (hints.map((hint, index) => {
                const options = {
                  type: hint.type,
                  filename: props.currentFile,
                  errCol: hint.column,
                  errLine: hint.line,
                  warning: hint.formattedMessage,
                  locationString: `${hint.line}:${hint.column}`,
                  location: { start: { line: hint.line, column: hint.column } },
                  isLibrary: false,
                  hasWarnings: hint.type === 'warning',
                  items: {
                    location: '',
                    warning: hint.formattedMessage,
                  }
                };
                (
                <div key={index}>
                      <div data-id={`staticAnalysisModulesolhintWarning`} id={`staticAnalysisModulesohint${hint.type}`}>
                        <ErrorRenderer name={`staticAnalysisModulesolhint${hint.type}${index}`} message={hint.formattedMessage} opt={options} warningErrors={ hint.formattedMessage} editor={props.analysisModule}/>
                      </div>
                </div>
              )}))
            }
          </div>
        </div>
      }
    </>
  )
    }