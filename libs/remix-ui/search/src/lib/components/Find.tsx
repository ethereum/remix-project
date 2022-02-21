import React, { useContext, useRef } from 'react'
import { SearchContext } from '../context/context'

export const Find = props => {
  const {
    setFind,
    state,
    toggleCaseSensitive,
    toggleMatchWholeWord,
    toggleUseRegex
  } = useContext(SearchContext)
  const timeOutId = useRef(null)
  const change = e => {
    clearTimeout(timeOutId.current)
    timeOutId.current = setTimeout(() => setFind(e.target.value), 500)
  }

  return (
    <>
      <div className="find-part">
        <label>search</label>
        <div className="search-input">
          <input
            id='search_input'
            placeholder="Search"
            className="form-control"
            onChange={change}
          ></input>
          <div className="controls">
            <div
              data-id='search_case_sensitive'
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
              data-id='search_whole_word'
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
              data-id='search_use_regex'
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
