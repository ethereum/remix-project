import React, { useContext, useEffect } from 'react'
import { SearchContext } from '../../context/context'
import { ResultItem } from './ResultItem'

export const Results = () => {
  const { state } = useContext(SearchContext)
  return (
    <div data-id='search_results' className='mt-2'>
      {state.find ? <div className='search_plugin_result_count_number badge badge-pill badge-secondary'>{state.count} results</div>: null}
      {state.find && state.count >= state.maxResults? <div className='alert alert-warning mt-1'>The result set only contains a subset of all matches<br></br>Please narrow down your search.</div>: null}
      {state.searchResults &&
        state.searchResults.map((result, index) => {
          return index <state.maxFiles? <ResultItem key={index} file={result} />: null
        })}
    </div>
  )
}
