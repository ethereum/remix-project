import { ViewPlugin } from '@remixproject/engine-web'
import React, { useContext, useEffect } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult } from '../../reducers/Reducer'

interface ResultItemProps {
  file: SearchResult
}

export const ResultFileName = (props: ResultItemProps) => {
  return (
    <div className="input-group udapp_nameNbuts">
      <div className="udapp_titleText input-group-prepend">
        <span className="input-group-text udapp_spanTitleText">
          {props.file.filename}
        </span>
      </div>
    </div>
  )
}
