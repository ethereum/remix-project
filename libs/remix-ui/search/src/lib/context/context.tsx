import React from 'react'
import { createContext, useReducer } from 'react'
import {
  SearchingInitialState,
  SearchReducer,
  SearchResult,
  SearchState
} from '../reducers/Reducer'

export interface SearchingStateInterface {
  state: SearchState
  setFind: (value: string) => void
  setReplace: (value: string) => void
  setInclude: (value: string) => void,
  setExclude: (value: string) => void,
  setCaseSensitive: (value: boolean) => void,
  setRegex: (value: boolean) => void,
  setWholeWord: (value: boolean) => void,
  setSearchResults: (value: SearchResult[]) => void,
}

export const SearchContext = createContext<SearchingStateInterface>(null)

export const SearchProvider = ({
  children = [],
  reducer = SearchReducer,
  initialState = SearchingInitialState
} = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = {
    state,
    setFind: (value: string) => {
      dispatch({
        type: 'SET_FIND',
        payload: value
      })
    },
    setReplace: (value: string) => {
      dispatch({
        type: 'SET_REPLACE',
        payload: value
      })
    },
    setInclude: (value: string) => {
      dispatch({
        type: 'SET_INCLUDE',
        payload: value
      })
    },
    setExclude(value: string) {
      dispatch({
        type: 'SET_EXCLUDE',
        payload: value
      })
    },
    setCaseSensitive(value: boolean) {
      dispatch({
        type: 'SET_CASE_SENSITIVE',
        payload: value
      })
    },
    setWholeWord(value: boolean) {
      dispatch({
        type: 'SET_WHOLE_WORD',
        payload: value
      })
    },
    setRegex(value: boolean) {
      dispatch({
        type: 'SET_REGEX',
        payload: value
      })
    },
    setSearchResults(value: SearchResult[]) {
      dispatch({
        type: 'SET_SEARCH_RESULTS',
        payload: value
      })
    } 
  }

  return (
    <>
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
    </>
  )
}
