import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, state } = useContext(SearchContext)
  const [str, setStr] = useState<string>('.git/**/*,.deps/**/*')
  const timeOutId = useRef(null)
  const change = e => {
    setStr(e.target.value)
    clearTimeout(timeOutId.current)
    timeOutId.current = setTimeout(() => setExclude(e.target.value), 500)
  }

  useEffect(() => {
    setExclude(str)
  }, [])

  return (
    <>
      <div className="find-part">
        <label>exclude</label>
        <input
          id='search_exclude'
          placeholder="Exclude ie .git/**/*"
          className="form-control"
          onChange={change}
          value={str}
        ></input>
      </div>
    </>
  )
}
