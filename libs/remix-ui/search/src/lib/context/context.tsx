import React, { useEffect, useRef, useState } from 'react'
import { createContext, useReducer } from 'react'
import {
  findLinesInStringWithMatch,
  getDirectory,
  replaceAllInFile,
  replaceTextInLine
} from '../components/results/SearchHelper'
import { SearchReducer } from '../reducers/Reducer'
import {
  SearchState,
  SearchResult,
  SearchResultLine,
  SearchResultLineLine,
  SearchingInitialState,
  undoBufferRecord
} from '../types'
import { filePathFilter } from '@jsdevtools/file-path-filter'
import { escapeRegExp } from 'lodash'

export interface SearchingStateInterface {
  state: SearchState
  setFind: (value: string) => void
  setReplace: (value: string) => void
  setReplaceEnabled: (value: boolean) => void
  setInclude: (value: string) => void
  setExclude: (value: string) => void
  setCaseSensitive: (value: boolean) => void
  setRegex: (value: boolean) => void
  setWholeWord: (value: boolean) => void
  setSearchResults: (value: SearchResult[]) => void
  findText: (path: string) => Promise<SearchResultLine[]>
  hightLightInPath: (result: SearchResult, line: SearchResultLineLine) => void
  replaceText: (
    result: SearchResult,
    line: SearchResultLineLine
  ) => Promise<void>
  reloadFile: (file: string) => void
  toggleCaseSensitive: () => void
  toggleMatchWholeWord: () => void
  toggleUseRegex: () => void
  setReplaceWithoutConfirmation: (value: boolean) => void
  disableForceReload: (file: string) => void
  updateCount: (count: number, file: string) => void
  replaceAllInFile: (result: SearchResult) => Promise<void>
  undoReplace: (buffer: undoBufferRecord) => Promise<void>
  clearUndo: () => void
  cancelSearch: (clearResults?: boolean) => Promise<void>
  startSearch: () => void
}

export const SearchContext = createContext<SearchingStateInterface>(null)

export const SearchProvider = ({
  children = [],
  reducer = SearchReducer,
  initialState = SearchingInitialState,
  plugin = undefined
} = {}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [files, setFiles] = useState([])
  const clearSearchingTimeout = useRef(null)
  const value = {
    state,
    setFind: (value: string) => {
      plugin.cancel('fileManager')
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
    setReplaceEnabled: (value: boolean) => {
      dispatch({
        type: 'SET_REPLACE_ENABLED',
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
    setReplaceWithoutConfirmation: (value: boolean) => {
      dispatch({
        type: 'SET_REPLACE_WITHOUT_CONFIRMATION',
        payload: value
      })
    },
    disableForceReload: (file: string) => {
      dispatch({
        type: 'DISABLE_FORCE_RELOAD',
        payload: file
      })
    },
    setCurrentFile: (file: string) => {
      dispatch({
        type: 'SET_CURRENT_FILE',
        payload: file
      })
    },
    setCurrentWorkspace: (workspace: any) => {
      dispatch({
        type: 'SET_CURRENT_WORKSPACE',
        payload: workspace
      })
    },
    updateCount: (count: number, file: string) => {
      dispatch({
        type: 'UPDATE_COUNT',
        payload: { count, file }
      })
    },
    setSearching(file: string) {
      dispatch({
        type: 'SET_SEARCHING',
        payload: file
      })
    },

    startSearch: () => {
      dispatch({
        type: 'START_SEARCH',
        payload: undefined
      })
    },

    setRun(value: boolean) {
      dispatch({
        type: 'SET_RUN',
        payload: value
      })
    },

    findText: async (path: string) => {
      if (!plugin) return
      try {
        if (state.find.length < 1) return
        value.setSearching(path)
        const text = await plugin.call('fileManager', 'readFile', path)
        const result: SearchResultLine[] = findLinesInStringWithMatch(
          text,
          createRegExFromFind()
        )
        clearTimeout(clearSearchingTimeout.current)
        clearSearchingTimeout.current = setTimeout(() => value.setSearching(null), 500)
        return result
      } catch (e) {
        console.log(e)
        value.setSearching(null)
        // do nothing
      }
    },
    hightLightInPath: async (
      result: SearchResult,
      line: SearchResultLineLine
    ) => {
      await plugin.call('editor', 'discardHighlight')
      await plugin.call('editor', 'highlight', line.position, result.path)
      await plugin.call(
        'editor',
        'revealRange',
        line.position.start.line,
        line.position.start.column,
        line.position.end.line,
        line.position.end.column
      )
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
        const replaced = replaceTextInLine(content, line, state.replace)
        await plugin.call('fileManager', 'setFile', result.path, replaced)
        setUndoState(content, replaced, result.path)
      } catch (e) {
        throw new Error(e)
      }
    },
    replaceAllInFile: async (result: SearchResult) => {
      await plugin.call('editor', 'discardHighlight')
      const content = await plugin.call('fileManager', 'readFile', result.path)
      const replaced = replaceAllInFile(
        content,
        createRegExFromFind(),
        state.replace
      )
      await plugin.call('fileManager', 'setFile', result.path, replaced)
      await plugin.call('fileManager', 'open', result.path)
      setUndoState(content, replaced, result.path)
    },
    setUndoEnabled: (path: string, workspace: string, content: string) => {
      dispatch({
        type: 'SET_UNDO_ENABLED',
        payload: {
          path,
          workspace,
          content
        }
      })
    },
    undoReplace: async (buffer: undoBufferRecord) => {
      const content = await plugin.call('fileManager', 'readFile', buffer.path)
      if (buffer.newContent !== content) {
        throw new Error('Can not undo replace, file has been changed.')
      }
      await plugin.call(
        'fileManager',
        'setFile',
        buffer.path,
        buffer.oldContent
      )
      await plugin.call('fileManager', 'open', buffer.path)
    },
    clearUndo: () => {
      dispatch({
        type: 'CLEAR_UNDO',
        payload: undefined
      })
    },

    clearStats: () => {
      plugin.call('editor', 'discardHighlight')
      dispatch({
        type: 'CLEAR_STATS',
        payload: undefined
      })
    },

    cancelSearch: async (clearResults = true) => {
      plugin.cancel('fileManager')
      if (clearResults) value.clearStats()
      value.setRun(false)
    },

    setClipped: (value: boolean) => {
      dispatch({
        type: 'SET_CLIPPED',
        payload: value
      })
    }
  }

  const reloadStateForFile = async (file: string) => {
    await value.reloadFile(file)
  }

  useEffect(() => {
    plugin.on('filePanel', 'setWorkspace', async workspace => {
      value.setSearchResults(null)
      value.clearUndo()
      value.setCurrentWorkspace(workspace.name)
      setFiles(await getDirectory('/', plugin))
    })
    plugin.on('fileManager', 'fileSaved', async file => {
      await reloadStateForFile(file)
      await checkUndoState(file)
    })
    plugin.on('fileManager', 'rootFolderChanged', async file => {
      const workspace = await plugin.call('filePanel', 'getCurrentWorkspace')
      if (workspace) value.setCurrentWorkspace(workspace.name)
      setFiles(await getDirectory('/', plugin))
    })

    plugin.on('fileManager', 'fileAdded', async file => {
      setFiles(await getDirectory('/', plugin))
      await reloadStateForFile(file)
    })
    plugin.on('fileManager', 'currentFileChanged', async file => {
      value.setCurrentFile(file)
      await checkUndoState(file)
    })
    async function fetchWorkspace() {
      try {
        const workspace = await plugin.call('filePanel', 'getCurrentWorkspace')
        if (workspace) value.setCurrentWorkspace(workspace.name)
        setFiles(await getDirectory('/', plugin))
      } catch (e) {
        console.log(e)
      }
    }
    setTimeout(async () => {
      await fetchWorkspace()
    }, 500)


    return () => {
      plugin.off('fileManager', 'fileChanged')
      plugin.off('filePanel', 'setWorkspace')
    }
  }, [])

  //*.sol, **/*.txt, contracts/*
  const setGlobalExpression = (paths: string) => {
    const results = []
    paths.split(',').forEach(path => {
      path = path.trim()
      if (path.startsWith('*.')) path = path.replace(/(\*\.)/g, '**/*.')
      if (path.endsWith('/*') && !path.endsWith('/**/*'))
        path = path.replace(/(\*)/g, '**/*.*')
      results.push(path)
    })
    return results
  }

  const checkUndoState = async (path: string) => {
    if (!plugin) return
    try {
      const content = await plugin.call('fileManager', 'readFile', path)
      const workspace = await plugin.call('filePanel', 'getCurrentWorkspace')
      value.setUndoEnabled(path, workspace.name, content)
    } catch (e) {
      console.log(e)
    }
  }

  const setUndoState = async (
    oldContent: string,
    newContent: string,
    path: string
  ) => {
    const workspace = await plugin.call('filePanel', 'getCurrentWorkspace')
    const undo = {
      oldContent,
      newContent,
      path,
      workspace: workspace.name
    }
    dispatch({
      type: 'SET_UNDO',
      payload: undo
    })
  }

  const createRegExFromFind = () => {
    let flags = 'g'
    let find = state.find
    if (!state.casesensitive) flags += 'i'
    if (!state.useRegExp) find = escapeRegExp(find)
    if (state.matchWord) find = `\\b${find}\\b`
    const re = new RegExp(find, flags)
    return re
  }

  useEffect(() => {
    if (state.count > 500) {
      value.setClipped(true)
      value.cancelSearch(false)
    }
  }, [state.count])

  useEffect(() => {
    if (state.find) {
      (async () => {
        try {
          const pathFilter: any = {}
          if (state.include) {
            pathFilter.include = setGlobalExpression(state.include)
          }
          if (state.exclude) {
            pathFilter.exclude = setGlobalExpression(state.exclude)
          }
          const filteredFiles = files
            .filter(filePathFilter(pathFilter))
            .map(file => {
              const r: SearchResult = {
                filename: file,
                lines: [],
                path: file,
                timeStamp: Date.now(),
                forceReload: false,
                count: 0
              }
              return r
            })
          value.setSearchResults(filteredFiles)
        } catch (e) {
          console.log(e)
        }
      })()
    }
  }, [state.timeStamp])

  return (
    <>
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
    </>
  )
}
