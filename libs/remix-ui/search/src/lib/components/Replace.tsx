import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const Replace = props => {
  const { setReplace } = useContext(SearchContext)
  const change = e => {
    const timeOutId = setTimeout(() => setReplace(e.target.value), 500)
    return () => clearTimeout(timeOutId)
  }

  return (
    <>
      <div className="find-part">
        <input
          placeholder="Replace"
          className="form-control"
          onChange={change}
        ></input>
      </div>
    </>
  )
}
