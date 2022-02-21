import React, { useEffect } from 'react'
import { createContext, useReducer } from 'react'
import {
  findLinesInStringWithMatch,
  getDirectory,
  replaceTextInLine
} from '../components/results/SearchHelper'
import { SearchReducer } from '../reducers/Reducer'
import {
  SearchState,
  SearchResult,
  SearchResultLine,
  SearchResultLineLine,
  SearchingInitialState
} from '../types'
import { filePathFilter } from '@jsdevtools/file-path-filter'
import { escapeRegExp } from 'lodash'

export interface SearchingStateInterface {
  state: SearchState
  setFind: (value: string) => void
  setReplace: (value: string) => void
  setInclude: (value: string) => void
  setExclude: (value: string) => void
  setCaseSensitive: (value: boolean) => void
  setRegex: (value: boolean) => void
  setWholeWord: (value: boolean) => void
  setSearchResults: (value: SearchResult[]) => void
  findText: (path: string) => Promise<SearchResultLine[]>
  hightLightInPath: (result: SearchResult, line: SearchResultLineLine) => void
  replaceText: (result: SearchResult, line: SearchResultLineLine) => void
  reloadFile: (file: string) => void
  toggleCaseSensitive: () => void
  toggleMatchWholeWord: () => void
  toggleUseRegex: () => void
}

export const SearchContext = createContext<SearchingStateInterface>(null)

export const SearchProvider = ({
  children = [],
  reducer = SearchReducer,
  initialState = SearchingInitialState,
  plugin = undefined
} = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  let reloadTimeOut: any = null

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
    },
    reloadFile: async (file: string) => {
      dispatch({
        type: 'RELOAD_FILE',
        payload: file
      })
    },
    toggleUseRegex: () => {
      dispatch({
        type: 'TOGGLE_USE_REGEX',
        payload: undefined
      })
    },
    toggleCaseSensitive: () => {
      dispatch({
        type: 'TOGGLE_CASE_SENSITIVE',
        payload: undefined
      })
    },
    toggleMatchWholeWord: () => {
      dispatch({
        type: 'TOGGLE_MATCH_WHOLE_WORD',
        payload: undefined
      })
    },
    findText: async (path: string) => {
      if (!plugin) return
      try {
        if (state.find.length < 3) return
        const text = await plugin.call('fileManager', 'readFile', path)
        let flags = 'g'
        let find = state.find
        if (!state.casesensitive) flags += 'i'
        if (state.matchWord) find = `\\b${find}\\b`
        if (!state.useRegExp) find = escapeRegExp(find)
        const re = new RegExp(find, flags)
        const result: SearchResultLine[] = findLinesInStringWithMatch(text, re)
        return result
      } catch (e) {}
    },
    hightLightInPath: async (
      result: SearchResult,
      line: SearchResultLineLine
    ) => {
      await plugin.call('editor', 'discardHighlight')
      await plugin.call('editor', 'highlight', line.position, result.path)
    },
    replaceText: async (result: SearchResult, line: SearchResultLineLine) => {
      try {
        await plugin.call('editor', 'discardHighlight')
        await plugin.call('editor', 'highlight', line.position, result.path)
        const content = await plugin.call(
          'fileManager',
          'readFile',
          result.path
        )

        await plugin.call(
          'fileManager',
          'setFile',
          result.path,
          replaceTextInLine(content, line, state.replace)
        )
      } catch (e) {
        throw new Error(e)
      }
    }
  }

  const reloadStateForFile = async (file: string) => {
    clearTimeout(reloadTimeOut)
    reloadTimeOut = setTimeout(async () => {
      await value.reloadFile(file)
    }, 1000)
  }

  useEffect(() => {
    plugin.on('filePanel', 'setWorkspace', () => {
      value.setSearchResults(null)
    })
    plugin.on('fileManager', 'fileSaved', async file => {
      await reloadStateForFile(file)
    })
    return () => {
      plugin.off('fileManager', 'fileChanged')
      plugin.off('filePanel', 'setWorkspace')
    }
  }, [])

  useEffect(() => {
    if (state.find) {
      (async () => {
        const res = await getDirectory('/', plugin)
        const pathFilter: any = {}
        if (state.include)
          pathFilter.include = state.include.split(',').map(i => i.trim())
        if (state.exclude)
          pathFilter.exclude = state.exclude.split(',').map(i => i.trim())
        const ob = res.filter(filePathFilter(pathFilter)).map(file => {
          const r: SearchResult = {
            filename: file,
            lines: [],
            path: file,
            timeStamp: Date.now()
          }
          return r
        })
        value.setSearchResults(ob)
      })()
    }
  }, [state.timeStamp])

  return (
    <>
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
    </>
  )
}
