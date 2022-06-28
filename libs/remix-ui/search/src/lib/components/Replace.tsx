import React, { useContext, useRef } from 'react'
import { useIntl } from 'react-intl'
import { SearchContext } from '../context/context'

export const Replace = props => {
  const { setReplace } = useContext(SearchContext)
  const timeOutId = useRef(null)
  const change = e => {
    clearTimeout(timeOutId.current)
    timeOutId.current = setTimeout(() => setReplace(e.target.value), 500)
  }

  const intl = useIntl()

  return (
    <>
      <div className="search_plugin_find-part ">
      <label className='d-none'>replace in files</label>
        <input
          id='search_replace'
          placeholder={intl.formatMessage({id: 'search.replace', defaultMessage: "Replace"})}
          className="form-control"
          onChange={change}
        ></input>
      </div>
    </>
  )
}
