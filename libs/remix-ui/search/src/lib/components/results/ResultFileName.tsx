import React, { useEffect, useState } from 'react'
import { SearchResult } from '../../types'
import { getPathIcon } from '@remix-ui/helper'
interface ResultItemProps {
  file: SearchResult
}

export const ResultFileName = (props: ResultItemProps) => {
  const [icon, setIcon] = useState<string>('')

  useEffect(() => {
    if (props.file && props.file.path) {
      setIcon(getPathIcon(props.file.path))
    }
  }, [props.file])

  return (
    <>
      {icon ? <div className={`${icon} caret caret_tv`}></div> : null}
      <div title={props.file.filename} className="search_file_name ml-2">
        {props.file.filename}
      </div>
    </>
  )
}
