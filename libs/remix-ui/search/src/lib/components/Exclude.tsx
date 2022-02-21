import React, { useContext, useEffect, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, state } = useContext(SearchContext)
  const [str, setStr] = useState<string>('.git/**/*,.deps/**/*')
  let timeOutId: any = null
  const change = e => {
    setStr(e.target.value)
    clearTimeout(timeOutId)
    timeOutId = setTimeout(() => setExclude(e.target.value), 500)
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
