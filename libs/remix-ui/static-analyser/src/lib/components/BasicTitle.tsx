import React from 'react'
import { ErrorRendererOptions } from '../../staticanalyser'

type BasicTitleProps = {
  warningStateEntries: any
  hideWarnings?: boolean
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
    <span>Remix{props.warningStateEntries.length > 0 ?   !props.hideWarnings ? <i data-id="StaticAnalysisErrorCount" className="badge badge-info rounded-circle ml-1">{calculateWarningStateEntries(props.warningStateEntries).length}</i>: (
      <i className="badge badge-info rounded-circle ml-1">
        {
          calculateWarningStateEntries(props.warningStateEntries).errors.length
        }
      </i>
    ) : null}
    </span>
  )
}
