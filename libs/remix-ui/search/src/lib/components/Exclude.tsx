import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, cancelSearch, startSearch } = useContext(SearchContext)
  const [excludeInput, setExcludeInput] = useState<string>('.*/**/*')

  const change = async e => {
    setExcludeInput(e.target.value)
    await cancelSearch()
  }

  const handleKeypress = async e => {
    await setExclude(excludeInput)
    if (e.charCode === 13 || e.keyCode === 13) {
      startSearch()
    }
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
          placeholder="Exclude ie .git/**/* ( Enter to exclude )"
          className="form-control"
          onKeyUp={handleKeypress}
          onChange={async (e) => change(e)}
          value={excludeInput}
        ></input>
      </div>
    </>
  )
}
