import React, { useContext } from 'react'
import { SearchContext } from '../../context/context'
import { ResultItem } from './ResultItem'

export const Results = () => {
  const { state } = useContext(SearchContext)

  return (
    <div data-id='search_results'>
      {state.searchResults &&
        state.searchResults.map((result, index) => {
          return <ResultItem key={index} file={result} />
        })}
    </div>
  )
}
