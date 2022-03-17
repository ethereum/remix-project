import React, { useContext, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Include = props => {
  const { setInclude, cancelSearch } = useContext(SearchContext)
  const [includeInput, setIncludeInput] = useState<string>('')
  const timeOutId = useRef(null)
  const change = async e => {
    setIncludeInput(e.target.value)
    clearTimeout(timeOutId.current)
    await cancelSearch()
    timeOutId.current = setTimeout(() => setInclude(e.target.value), 500)
  }

  return (
    <>
      <div className="search_plugin_find-part pl-3">
        <label className='mt-2'>Files to include</label>
        <input
          id='search_include'
          placeholder="Include ie contracts/**/*.sol"
          className="form-control"
          onChange={async(e) => change(e)}
          value={includeInput}
        ></input>
      </div>
    </>
  )
}
