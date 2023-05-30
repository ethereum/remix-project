import React from 'react'

type BasicTitleProps = {
  warningStateEntries: any
}

export function calculateWarningStateEntries(entries: any[][]) {
  let warninglength = 0
  entries.forEach((entry) => {
    warninglength += entry[1].length
  })
  return warninglength
}

export function BasicTitle(props: BasicTitleProps) {
  return (
    <span className="rounded-circle">Basic{props.warningStateEntries.length > 0 ? <i className="badge badge-info rounded-circle ml-2">{calculateWarningStateEntries(props.warningStateEntries)}</i>: null}
    </span>
  )
}