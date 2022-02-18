import React, { useContext, useEffect } from 'react'
import { SearchContext } from '../context/context'

export const Replace = props => {
  const { state, setReplace } = useContext(SearchContext)

  const change = e => {
    setReplace(e.target.value)
  }

  return (
    <>
      <input placeholder='Replace' className="form-control" onChange={change}></input>
    </>
  )
}
