import { ViewPlugin } from '@remixproject/engine-web'
import { matches } from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../../context/context'
import { SearchResult, SearchResultLine } from '../../reducers/Reducer'
import { ResultItem } from './ResultItem'
import { findLinesInStringWithMatch } from './SearchHelper'
const filePathFilter = require('@jsdevtools/file-path-filter')

interface ResultsProps {
  plugin: ViewPlugin
}

export const Results = (props: ResultsProps) => {
  const { state, setSearchResults, setFind } = useContext(SearchContext)
  const [ alertText, setAlertText ] = useState('')
  const { plugin } = props

  const getDirectory = async (dir: string) => {
    let result = []
    const files = await plugin.call('fileManager', 'readdir', dir)
    const fileArray = normalize(files)
    for (const fi of fileArray) {
      if (fi) {
        const type = fi.data.isDirectory
        if (type === true) {
          result = [...result, ...(await getDirectory(`${fi.filename}`))]
        } else {
          result = [...result, fi.filename]
        }
      }
    }
    return result
  }

  const normalize = filesList => {
    const folders = []
    const files = []
    Object.keys(filesList || {}).forEach(key => {
      if (filesList[key].isDirectory) {
        folders.push({
          filename: key,
          data: filesList[key]
        })
      } else {
        files.push({
          filename: key,
          data: filesList[key]
        })
      }
    })
    return [...folders, ...files]
  }

  useEffect(() => {
    plugin.on('filePanel', 'setWorkspace', () => {
      setSearchResults(null)
    })
    return () => plugin.off('filePanel', 'setWorkspace')
  }, [])

  useEffect(() => {
    if (state.find) {
      (async () => {
        const res = await getDirectory('/')
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
            searchComplete: false
          }
          return r
        })
        setSearchResults(ob)
      })()
    }
  }, [state.find, state.replace, state.include, state.exclude])

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
