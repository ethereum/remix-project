import React, { useContext, useEffect } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude } = useContext(SearchContext)
  const change = e => {
    const timeOutId = setTimeout(() => setExclude(e.target.value), 500)
    return () => clearTimeout(timeOutId)
  }

  useEffect(() => {
    setExclude('.git/**')
  }, [])

  return (
    <>
      <div className="find-part">
        <input
          placeholder="Exclude ie .git/**"
          className="form-control"
          onChange={change}
        ></input>
      </div>
    </>
  )
}
