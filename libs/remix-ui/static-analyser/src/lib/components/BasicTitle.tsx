import React, { useEffect } from 'react'
import { ErrorRendererOptions } from '../../staticanalyser'

type BasicTitleProps = {
  warningStateEntries: any
  hideWarnings?: boolean
  showLibsWarnings?: boolean
  ssaWarnings: any[]
  ssaWarningsNoLibs: any[]
}

type warningResultOption = {
  hasWarning: boolean
  msg: string
  options: ErrorRendererOptions
}

type WarningResultType = {
  categoryName: string
  opts: warningResultOption[]
}

export function calculateWarningStateEntries(entries: [string, any][]) {
  let warninglength = 0
  entries.forEach((entry) => {
    warninglength += entry[1].length
  })
  let errors = []
  entries.forEach((entry) => {
    errors = entry[1].filter(x => x.options.type === 'error')
  })
  return { length: warninglength, errors }
}

export function BasicTitle(props: BasicTitleProps) {

  return (
    <span id="ssaRemixtab">
      Remix
      {props.ssaWarnings.length > 0 ? (
        props.hideWarnings === false ? (
          props.showLibsWarnings === false ? (
            <span
              data-id="RemixStaticAnalysisErrorCount"
              className={`badge ${props.ssaWarningsNoLibs.length > 0 ? "badge-warning"
                  : "badge-danger"
              } badge-pill ml-1 px-1 text-center`}
            >
              {props.ssaWarnings.filter(x => x.options.isLibrary === false).length}
            </span>
          ) : (
            <span data-id="RemixStaticAnalysisErrorCount" className="badge badge-warning rounded-circle ml-1 text-center">
              {props.ssaWarnings.length}
            </span>
          )
        ) : null
      ) : null}
    </span>
  );
}
