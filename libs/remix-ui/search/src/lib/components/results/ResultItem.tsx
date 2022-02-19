import { ViewPlugin } from '@remixproject/engine-web'
import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine } from '../../reducers/Reducer'
import { ResultFileName } from './ResultFileName'
import { ResultSummary } from './ResultSummary'

interface ResultItemProps {
  file: SearchResult
}

export const ResultItem = (props: ResultItemProps) => {
  const { state, findText } = useContext(SearchContext)

  const [lines, setLines] = useState<SearchResultLine[]>([])
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)

  useEffect(() => {
    if (!props.file.searchComplete) {
      // console.log('searching for: ' + props.file.filename)
    }
  }, [props.file.searchComplete])

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  useEffect(() => {
    if (!props.file.searchComplete) {
      findText(props.file.filename).then(res => {
        setLines(res)
      })
    }
  }, [state.find])

  return (
    <>
      {lines && lines.length ? (
        <>
          <div onClick={toggleClass} className="search_result_item_title">
            <button className="btn" >
              <i
                className={`fas ${
                  toggleExpander ? 'fa-angle-right' : 'fa-angle-down'
                }`}
                aria-hidden="true"
              ></i>
            </button>{' '}
            <ResultFileName file={props.file} />
          </div>
          {!toggleExpander ? (
            <ul>
              {lines.map((line, index) => (
                <ResultSummary key={index} searchResult={props.file} line={line} />
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <></>
      )}
    </>
  )
}
