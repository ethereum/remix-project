import { getPathIcon } from '@remix-ui/helper'
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
export const FileBlok = (props: any) => {

  const { file } = props

  const handleFileClick = (event: SyntheticEvent) => {
    event.stopPropagation()
    props.handleClickFile(file.path, file.type)
  }
  return (
    <>
    
      <div className={`pr-2 pl-2 ${getPathIcon(props.file.path)} caret caret_tv`}></div>
      <div onClick={handleFileClick} className="btn">{props.file.name}</div>
    </>)
}