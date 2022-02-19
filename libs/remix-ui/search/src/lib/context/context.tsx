import React from 'react'
import { createContext, useReducer } from 'react'
import { findLinesInStringWithMatch } from '../components/results/SearchHelper'
import {
  SearchingInitialState,
  SearchReducer,
  SearchResult,
  SearchResultLine,
  SearchResultLineLine,
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
  findText: (path: string) => Promise<SearchResultLine[]>,
  hightLightInPath: (path:SearchResult, line:SearchResultLineLine) => void,
}

export const SearchContext = createContext<SearchingStateInterface>(null)

export const SearchProvider = ({
  children = [],
  reducer = SearchReducer,
  initialState = SearchingInitialState,
  plugin = undefined
} = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = {
    state,
    setFind: (value: string) => {
      console.log('setFind: ' + value)
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
    },
    findText : async (path: string) => {
      if(!plugin) return
      try {
        if(state.find.length < 3) return
        const text = await plugin.call('fileManager', 'readFile', path)
        const re = new RegExp(state.find, 'gi')
        const result: SearchResultLine[] = findLinesInStringWithMatch(text, re)
        // console.log(result, path)
        return result
      } catch (e) {}
    },
    hightLightInPath: async(result: SearchResult, line: SearchResultLineLine) => {
      await plugin.call('editor', 'discardHighlight')
      await plugin.call('editor', 'highlight', line.position, result.path)
    }

  }

  return (
    <>
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
    </>
  )
}
