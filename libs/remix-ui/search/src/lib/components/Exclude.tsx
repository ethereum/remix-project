import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, state } = useContext(SearchContext)
  const [str, setStr] = useState<string>('.git/**/*,.deps/**/*')
  const change = e => {
    setStr(e.target.value)
    const timeOutId = setTimeout(() => setExclude(e.target.value), 500)
    return () => clearTimeout(timeOutId)
  }

  useEffect(() => {
    setExclude('.git/**')
  }, [])

  return (
    <>
      <div className="find-part">
        <label>exclude</label>
        <input
          placeholder="Exclude ie .git/**/*"
          className="form-control"
          onChange={change}
          value={str}
        ></input>
      </div>
    </>
  )
}
