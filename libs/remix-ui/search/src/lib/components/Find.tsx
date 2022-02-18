import React, { useContext, useReducer } from "react"
import { SearchContext } from "../context/context"
import { SearchingInitialState, SearchReducer } from "../reducers/Reducer"



export const Find = props => {

    const { setFind } = useContext(SearchContext)
    const change = (e) => {
        setFind(e.target.value)
    }

    return(<>
        <input placeholder="Search" className="form-control" onChange={change}></input>
    </>)
}