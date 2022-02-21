import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const Find = props => {
  const {
    setFind,
    state,
    toggleCaseSensitive,
    toggleMatchWholeWord,
    toggleUseRegex
  } = useContext(SearchContext)
  let timeOutId: any = null
  const change = e => {
    clearTimeout(timeOutId)
    timeOutId = setTimeout(() => setFind(e.target.value), 500)
  }

  return (
    <>
      <div className="find-part">
        <label>search</label>
        <div className="search-input">
          <input
            placeholder="Search"
            className="form-control"
            onChange={change}
          ></input>
          <div className="controls">
            <div
              title="Match Case"
              className={`monaco-custom-checkbox codicon codicon-case-sensitive ${
                state.casesensitive ? 'checked' : ''
              }`}
              role="checkbox"
              aria-checked="false"
              aria-label="Match Case"
              aria-disabled="false"
              onClick={() => {
                toggleCaseSensitive()
              }}
            ></div>
            <div
              title="Match Whole Word"
              className={`monaco-custom-checkbox codicon codicon-whole-word ${
                state.matchWord ? 'checked' : ''
              }`}
              role="checkbox"
              aria-checked="false"
              aria-label="Match Whole Word"
              aria-disabled="false"
              onClick={() => {
                toggleMatchWholeWord()
              }}
            ></div>
            <div
              title="Use Regular Expression"
              className={`monaco-custom-checkbox codicon codicon-regex ${
                state.useRegExp ? 'checked' : ''
              }`}
              role="checkbox"
              aria-checked="false"
              aria-label="Use Regular Expression"
              aria-disabled="false"
              onClick={() => {
                toggleUseRegex()
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  )
}
