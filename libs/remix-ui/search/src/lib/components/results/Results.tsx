import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../../context/context'
import { ResultItem } from './ResultItem'
interface ResultsProps {
}

export const Results = (props: ResultsProps) => {
  const { state} = useContext(SearchContext)
  const [alertText, setAlertText] = useState('')

  return (
    <>
      {alertText ? (
        <div className="alert alert-success mt-1" role="alert">
          {alertText}
        </div>
      ) : null}
      {state.searchResults &&
        state.searchResults.map((result, index) => {
          return <ResultItem key={index} file={result} />
        })}
    </>
  )
}
