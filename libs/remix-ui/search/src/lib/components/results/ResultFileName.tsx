import React from 'react'
import { SearchResult } from '../../types'

interface ResultItemProps {
  file: SearchResult
}

export const ResultFileName = (props: ResultItemProps) => {
  return (
    <div title={props.file.filename} className="input-group udapp_nameNbuts">
      <div className="udapp_titleText input-group-prepend">
        <span className="input-group-text udapp_spanTitleText">
          {props.file.filename}
        </span>
      </div>
    </div>
  )
}
