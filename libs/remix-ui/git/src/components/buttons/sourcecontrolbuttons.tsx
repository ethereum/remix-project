import { faArrowDown, faArrowUp, faArrowsUpDown, faArrowRotateRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CustomTooltip } from "@remix-ui/helper"
import React, { useState } from "react"
import { FormattedMessage } from "react-intl"
import { branch, remote } from "../../types"

interface SourceControlButtonsProps {
  remote?: remote,
  branch?: branch
}

export const SourceControlButtons = (props: SourceControlButtonsProps) => {
  const { remote, branch } = props

  return (<span className='d-flex justify-content-end align-items-center w-25'>
    <CustomTooltip tooltipText={<FormattedMessage id="git.pull" />}>
      <button onClick={async () => { }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowDown} className="" /></button>
    </CustomTooltip>
    <CustomTooltip tooltipText={<FormattedMessage id="git.push" />}>
      <button onClick={async () => { }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowUp} className="" /></button>
    </CustomTooltip>
    <CustomTooltip tooltipText={<FormattedMessage id="git.sync" />}>
      <button onClick={async () => { }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowsUpDown} className="" /></button>
    </CustomTooltip>
    <CustomTooltip tooltipText={<FormattedMessage id="git.refresh" />}>
      <button onClick={async () => { }} className='btn btn-sm'><FontAwesomeIcon icon={faArrowRotateRight} className="" /></button>
    </CustomTooltip>
  </span>)
}