import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, state } = useContext(SearchContext)
  const [excludeInput, setExcludeInput] = useState<string>('.git/**/*,.deps/**/*')
  const timeOutId = useRef(null)
  const change = e => {
    setExcludeInput(e.target.value)
    clearTimeout(timeOutId.current)
    timeOutId.current = setTimeout(() => setExclude(e.target.value), 500)
  }

  useEffect(() => {
    setExclude(excludeInput)
  }, [])

  return (
    <>
      <div className="search_plugin_find-part">
        <label>exclude</label>
        <input
          id='search_exclude'
          placeholder="Exclude ie .git/**/*"
          className="form-control"
          onChange={change}
          value={excludeInput}
        ></input>
      </div>
    </>
  )
}
