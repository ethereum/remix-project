import React, { useContext, useEffect, useReducer } from 'react'
import { SearchContext, SearchProvider } from '../context/context'
import { SearchingInitialState, SearchReducer } from '../reducers/Reducer'
import { Find } from './Find'
import { Replace } from './Replace'
import { Results } from './results/Results'

export const SearchTab = props => {

const plugin = props.plugin

useEffect(() => {
    console.log (plugin)
},[])

return (
    <>
      <SearchProvider>
        <Find></Find>
        <Replace></Replace>
        <Results plugin={plugin}></Results>
      </SearchProvider>
    </>
  )
}
