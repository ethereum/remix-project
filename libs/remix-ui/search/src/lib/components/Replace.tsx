import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const Replace = props => {
  const { setReplace } = useContext(SearchContext)
  let timeOutId: any = null
  const change = e => {
    clearTimeout(timeOutId)
    timeOutId = setTimeout(() => setReplace(e.target.value), 500)
  }

  return (
    <>
      <div className="find-part">
      <label>replace</label>
        <input
          placeholder="Replace"
          className="form-control"
          onChange={change}
        ></input>
      </div>
    </>
  )
}
