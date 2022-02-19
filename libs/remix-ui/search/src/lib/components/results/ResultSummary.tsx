import { ViewPlugin } from '@remixproject/engine-web'
import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine, SearchResultLineLine } from '../../reducers/Reducer'
import { ResultFileName } from './ResultFileName'

interface ResultSummaryProps {
  searchResult: SearchResult
  line: SearchResultLine
}

export const ResultSummary = (props: ResultSummaryProps) => {
  const { hightLightInPath } = useContext(SearchContext)
  const selectLine = async (line: SearchResultLineLine) => {
    console.log(line, props.searchResult)
    await hightLightInPath(props.searchResult, line)
  }
  return (
    <li className="p-1 wrap_summary">
      {props.line.lines.map((lineItem, index) => (
        <div
          onClick={async () => {
            selectLine(lineItem)
          }}
          key={index}
        >
          {lineItem.left.substring(lineItem.left.length - 20)}
          <mark>{lineItem.center}</mark>
          {lineItem.right.substring(0, 100)}
        </div>
      ))}
    </li>
  )
}
