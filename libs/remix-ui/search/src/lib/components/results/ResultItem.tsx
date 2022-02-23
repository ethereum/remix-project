import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine } from '../../types'
import { ResultFileName } from './ResultFileName'
import { ResultSummary } from './ResultSummary'

interface ResultItemProps {
  file: SearchResult
}

export const ResultItem = (props: ResultItemProps) => {
  const { state, findText, disableForceReload, updateCount } = useContext(
    SearchContext
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [lines, setLines] = useState<SearchResultLine[]>([])
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)
  const reloadTimeOut = useRef(null)
  const subscribed = useRef(true)

  useEffect(() => {
    reload()
  }, [props.file.timeStamp])

  useEffect(() => {
    if (props.file.forceReload) {
      clearTimeout(reloadTimeOut.current)
      reloadTimeOut.current = setTimeout(() => reload(), 1000)
    }
  }, [props.file.forceReload])

  const toggleClass = () => {
    setToggleExpander(!toggleExpander)
  }

  useEffect(() => {
    reload()
  }, [state.find])

  useEffect(() => {
    subscribed.current = true
    return () => {
      subscribed.current = false
    }
  }, [])

  const reload = () => {
    findText(props.file.filename).then(res => {
      if (subscribed.current) {
        setLines(res)
        if (res) updateCount(res.length)
        setLoading(false)
        disableForceReload(props.file.filename)
      }
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
            <div className="result_count">
              <div className="result_count_number badge badge-pill badge-secondary">
                {lines.length}
              </div>
            </div>
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
