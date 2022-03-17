import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const Include = props => {
  const { setInclude, cancelSearch } = useContext(SearchContext)
  const [includeInput, setIncludeInput] = useState<string>('*.sol, *.js')
  const change = async e => {
    setIncludeInput(e.target.value)
    await cancelSearch()
  }
  const handleKeypress = async e => {
    if (e.charCode === 13 || e.keyCode === 13) {
      await setInclude(includeInput)
    }
  }

  useEffect(() => {
    setInclude(includeInput)
  }, [])

  return (
    <>
      <div className="search_plugin_find-part pl-3">
        <label className='mt-2'>Files to include</label>
        <input
          id='search_include'
          placeholder="Include ie *.sol ( Enter to include )"
          className="form-control"
          onChange={async(e) => change(e)}
          onKeyPress={handleKeypress}
          value={includeInput}
        ></input>
      </div>
    </>
  )
}
