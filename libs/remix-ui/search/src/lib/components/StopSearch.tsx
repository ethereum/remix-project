import React from "react"
import { useContext } from "react"
import { SearchContext } from "../context/context"

export const StopSearch = () => {
    const { cancelSearch } = useContext(SearchContext)
    const cancel = async () => {
        await cancelSearch(false)
      }
    return (
        <a className="badge badge-danger search_plugin_stop" onClick={async () => await cancel()}>stop</a>
    )
}