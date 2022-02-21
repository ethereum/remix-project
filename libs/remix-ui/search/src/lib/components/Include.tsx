import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const Include = props => {
  const { setInclude } = useContext(SearchContext)
  let timeOutId: any = null
  const change = e => {
    clearTimeout(timeOutId)
    timeOutId = setTimeout(() => setInclude(e.target.value), 500)
  }

  return (
    <>
      <div className="find-part">
        <label>include</label>
        <input
          placeholder="Include ie contracts/**/*.sol"
          className="form-control"
          onChange={change}
        ></input>
      </div>
    </>
  )
}
