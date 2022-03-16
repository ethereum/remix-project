
import { useDialogDispatchers } from '@remix-ui/app'
import React, { useContext } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine, SearchResultLineLine } from '../../types'

interface ResultSummaryProps {
  searchResult: SearchResult
  line: SearchResultLine
  setLoading: (value: boolean) => void
}

export const ResultSummary = (props: ResultSummaryProps) => {
  const { hightLightInPath, replaceText, state } = useContext(SearchContext)
  const { modal } = useDialogDispatchers()
  const selectLine = async (line: SearchResultLineLine) => {
    await hightLightInPath(props.searchResult, line)
  }

  const confirmReplace = async (line: SearchResultLineLine) => {
    props.setLoading(true)
    try{
      await replaceText(props.searchResult, line)
    }catch(e){
      props.setLoading(false) 
    }
  }

  const replace = async (line: SearchResultLineLine) => {
    if(state.replaceWithOutConfirmation){
      confirmReplace(line)
    }else{
      modal({ id: 'confirmreplace', title: 'Replace', message: `Are you sure you want to replace '${line.center}' by '${state.replace}' in ${props.searchResult.filename}?`, okLabel: 'Yes', okFn: confirmReplace, cancelLabel: 'No', cancelFn: ()=>{}, data: line })
    }
  }

  return (
    <>
      {props.line.lines.map((lineItem, index) => (
        <div className='search_plugin_search_line_container' key={index}>
        <div
          onClick={async () => {
            selectLine(lineItem)
          }}
          data-id={`${props.searchResult.filename}-${lineItem.position.start.line}-${lineItem.position.start.column}`}
          key={props.searchResult.filename}
          className='search_plugin_search_line  pb-1'
        >
          <div className='search_plugin_summary_left'>{lineItem.left.substring(lineItem.left.length - 20).trimStart()}</div>
          <mark className={`search_plugin_summary_center ${state.replace && state.replaceEnabled? 'search_plugin_replace_strike':''}`}>{lineItem.center}</mark>
          {state.replace && state.replaceEnabled? <mark className='search_plugin_replacement'>{state.replace}</mark>:<></>}
          <div className='search_plugin_summary_right'>{lineItem.right.substring(0, 100)}</div>
        </div>
        {state.replaceEnabled?
        <div className='search_plugin_search_control'>
        <div title="Replace" data-id={`replace-${props.searchResult.filename}-${lineItem.position.start.line}-${lineItem.position.start.column}`} onClick={async () => {
            replace(lineItem)
          }} className="codicon codicon-find-replace" role="button" aria-label="Replace" aria-disabled="false"></div>
        </div>:null}
        </div>
      ))}
    </>
  )
}
