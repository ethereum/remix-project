import React from "react"
import { useContext } from "react"
import { SearchContext } from "../context/context"

export const CacncelSearch = () => {
    const { cancelSearch } = useContext(SearchContext)
    const cancel = async () => {
        await cancelSearch()
      }
    return (
        <a onClick={async () => await cancel()}>stop</a>
    )
}