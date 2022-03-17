import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, cancelSearch } = useContext(SearchContext)
  const [excludeInput, setExcludeInput] = useState<string>('.*/**/*')
  const timeOutId = useRef(null)
  const change = async e => {
    setExcludeInput(e.target.value)
    clearTimeout(timeOutId.current)
    await cancelSearch()
    timeOutId.current = setTimeout(() => setExclude(e.target.value), 500)
  }

  useEffect(() => {
    setExclude(excludeInput)
  }, [])

  return (
    <>
      <div className="search_plugin_find-part pl-3">
        <label className='mt-2'>Files to exclude</label>
        <input
          id='search_exclude'
          placeholder="Exclude ie .git/**/*"
          className="form-control"
          onChange={async(e) => change(e)}
          value={excludeInput}
        ></input>
      </div>
    </>
  )
}
