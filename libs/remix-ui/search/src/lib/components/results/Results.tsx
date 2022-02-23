import React, { useContext, useEffect } from 'react'
import { SearchContext } from '../../context/context'
import { ResultItem } from './ResultItem'

export const Results = () => {
  const { state } = useContext(SearchContext)
  return (
    <div data-id='search_results'>
      {state.find ? <div className='result_count_number badge badge-pill badge-secondary'>{state.count} results</div>: null}
      {state.count < state.maxResults && state.searchResults &&
        state.searchResults.map((result, index) => {
          return <ResultItem key={index} file={result} />
        })}
      {state.find && state.count >= state.maxResults? <div className='alert alert-warning mt-1'>Too many results to display.<br></br>Please narrow your search.</div>: null}
    </div>
  )
}
