import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const Include = props => {
  const { setInclude } = useContext(SearchContext)
  const change = e => {
    const timeOutId = setTimeout(() => setInclude(e.target.value), 500)
    return () => clearTimeout(timeOutId)
  }

  return (
    <>
      <div className="find-part">
        <input
          placeholder="Include ie contracts/**/*.sol"
          className="form-control"
          onChange={change}
        ></input>
      </div>
    </>
  )
}
