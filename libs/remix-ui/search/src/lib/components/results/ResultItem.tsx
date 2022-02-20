import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine } from '../../types'
import { ResultFileName } from './ResultFileName'
import { ResultSummary } from './ResultSummary'

interface ResultItemProps {
  file: SearchResult
}

export const ResultItem = (props: ResultItemProps) => {
  const { state, findText } = useContext(SearchContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [lines, setLines] = useState<SearchResultLine[]>([])
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)

  useEffect(() => {
    reload()
  }, [props.file.timeStamp])

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  useEffect(() => {
    reload()
  }, [state.find])

  const reload = () => {
    findText(props.file.filename).then(res => {
      setLines(res)
      setLoading(false)
    })
  }

  return (
    <>
      {lines && lines.length ? (
        <>
          <div onClick={toggleClass} className="search_result_item_title">
            <button className="btn">
              <i
                className={`fas ${
                  toggleExpander ? 'fa-angle-right' : 'fa-angle-down'
                }`}
                aria-hidden="true"
              ></i>
            </button>{' '}
            <ResultFileName file={props.file} />
          </div>
          {loading ? <div className="loading">Loading...</div> : null}
          {!toggleExpander && !loading ? (
            <div className="p-1 wrap_summary">
              {lines.map((line, index) => (
                <ResultSummary
                  setLoading={setLoading}
                  key={index}
                  searchResult={props.file}
                  line={line}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <></>
      )}
    </>
  )
}
