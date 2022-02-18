import { ViewPlugin } from "@remixproject/engine-web"
import React, { useContext, useEffect } from "react"
import { SearchContext } from "../../context/context"
import { SearchResult } from "../../reducers/Reducer"

interface ResultsProps {
    plugin: ViewPlugin
}

export const Results = (props: ResultsProps) => {

    const { state, setSearchResults } = useContext(SearchContext)

    const { plugin } = props

    const getDirectory = async (dir) => {
        let result = []
        const files = await plugin.call('fileManager', 'readdir', dir)
        const fileArray = normalize(files)
        for (const fi of fileArray) {
          if (fi) {
            const type = fi.data.isDirectory
            if (type === true) {
              result = [
                ...result,
                ...(await getDirectory(
                  `${fi.filename}`
                ))
              ]
            } else {
              result = [...result, fi.filename]
            }
          }
        }
        return result
    }

    const normalize = (filesList) => {
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
        if (state.find) {
            getDirectory('/').then(res => {
                const ob = res.map(file => {   
                    const r:SearchResult = {
                        filename: file,
                        lines: [],
                        path: file,
                        searchComplete: false
                    }
                    return r
                })
                console.log(ob)
                setSearchResults(ob)
            })
        }
    },[state.find])


    useEffect(() => {
       console.log(state.searchResults)
    },[state.searchResults])
    
    return(<></>)
}