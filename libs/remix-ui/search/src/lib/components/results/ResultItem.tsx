import { useDialogDispatchers } from '@remix-ui/app'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine } from '../../types'
import { ResultFileName } from './ResultFileName'
import { ResultSummary } from './ResultSummary'

interface ResultItemProps {
  file: SearchResult
}

export const ResultItem = (props: ResultItemProps) => {
  const { state, findText, disableForceReload, updateCount, replaceAllInFile } = useContext(
    SearchContext
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [lines, setLines] = useState<SearchResultLine[]>([])
  const [toggleExpander, setToggleExpander] = useState<boolean>(false)
  const reloadTimeOut = useRef(null)
  const subscribed = useRef(true)
  const { modal } = useDialogDispatchers()

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
      updateCount(0, props.file.filename)
      subscribed.current = false
    }
  }, [])

  const confirmReplace = async () => {
    setLoading(true)
    try {
      await replaceAllInFile(props.file)
    } catch (e) {
    }
    setLoading(false)
  }

  const replace = async () => {
    if(state.replaceWithOutConfirmation){
      confirmReplace()
    }else{
      modal({ id: 'confirmreplace', title: 'Replace', message: `Are you sure you want to replace '${state.find}' by '${state.replace}' in ${props.file.filename}?`, okLabel: 'Yes', okFn: confirmReplace, cancelLabel: 'No', cancelFn: ()=>{}, data: null })
    }
  }

  const reload = () => {
    findText(props.file.filename).then(res => {
      if (subscribed.current) {
        setLines(res)
        if (res) {
          let count = 0
          res.forEach(line => {
            count += line.lines.length
          })
          updateCount(count, props.file.filename)
        }
        setLoading(false)
        disableForceReload(props.file.filename)
      }
    })
  }

  return (
    <>
      {lines && lines.length ? (
        <>
          <div onClick={toggleClass} className="search_plugin_search_result_item_title">
            <button className="btn">
              <i
                className={`fas ${
                  toggleExpander ? 'fa-angle-right' : 'fa-angle-down'
                }`}
                aria-hidden="true"
              ></i>
            </button>{' '}
            <ResultFileName file={props.file} />
            <div className="search_plugin_result_count">
              <div className="search_plugin_result_count_number badge badge-pill badge-secondary">
                {props.file.count}
              </div>
            </div>
          </div>
          {loading ? <div className="loading">Loading...</div> : null}
          {!toggleExpander && !loading ? (
            <div className="search_plugin_wrap_summary">
              {state.replaceEnabled? <div onClick={async() => replace()} className='btn btn-secondary btn-block mb-2 btn-sm'>Replace all</div>:null}
              {lines.map((line, index) => (   
                index < state.maxLines ? 
                <ResultSummary
                  setLoading={setLoading}
                  key={index}
                  searchResult={props.file}
                  line={line}
                />: null
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
