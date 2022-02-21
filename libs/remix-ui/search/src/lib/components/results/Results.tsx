import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../../context/context'
import { ResultItem } from './ResultItem'

export const Results = () => {
  const { state } = useContext(SearchContext)

  return (
    <>
      {state.searchResults &&
        state.searchResults.map((result, index) => {
          return <ResultItem key={index} file={result} />
        })}
    </>
  )
}
