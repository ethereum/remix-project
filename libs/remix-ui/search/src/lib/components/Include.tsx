import React, { useContext, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Include = props => {
  const { setInclude } = useContext(SearchContext)
  const [str, setStr] = useState<string>('')
  const timeOutId = useRef(null)
  const change = e => {
    setStr(e.target.value)
    clearTimeout(timeOutId.current)
    timeOutId.current = setTimeout(() => setInclude(e.target.value), 500)
  }

  return (
    <>
      <div className="find-part">
        <label>include</label>
        <input
          id='search_include'
          placeholder="Include ie contracts/**/*.sol"
          className="form-control"
          onChange={change}
          value={str}
        ></input>
      </div>
    </>
  )
}
