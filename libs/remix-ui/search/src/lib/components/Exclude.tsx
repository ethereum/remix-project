import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Exclude = props => {
  const { setExclude, cancelSearch } = useContext(SearchContext)
  const [excludeInput, setExcludeInput] = useState<string>('.*/**/*')

  const change = async e => {
    setExcludeInput(e.target.value)
    await cancelSearch()
  }
  
  const handleKeypress = async e => {
    if (e.charCode === 13 || e.keyCode === 13) {
      await setExclude(excludeInput)
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
          id='search_exclude ( Enter to exclude )'
          placeholder="Exclude ie .git/**/*"
          className="form-control"
          onKeyPress={handleKeypress}
          onChange={async(e) => change(e)}
          value={excludeInput}
        ></input>
      </div>
    </>
  )
}
