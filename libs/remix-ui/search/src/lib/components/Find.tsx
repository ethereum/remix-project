import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const Find = props => {
  const { setFind } = useContext(SearchContext)
  const change = e => {
    const timeOutId = setTimeout(() => setFind(e.target.value), 500)
    return () => clearTimeout(timeOutId)
  }

  return (
    <>
      <div className="find-part">
        <input
          placeholder="Search"
          className="form-control"
          onChange={change}
        ></input>
        {/* <div className="controls">
          <div
            title="Match Case (⌥⌘C)"
            className="monaco-custom-checkbox codicon codicon-case-sensitive"
            role="checkbox"
            aria-checked="false"
            aria-label="Match Case (⌥⌘C)"
            aria-disabled="false"
          ></div>
          <div
            title="Match Whole Word"
            className="monaco-custom-checkbox codicon codicon-whole-word"
            role="checkbox"
            aria-checked="false"
            aria-label="Match Whole Word"
            aria-disabled="false"
          ></div>
        </div> */}
      </div>
    </>
  )
}
