import React, { useContext } from 'react'
import { SearchContext } from '../context/context'

export const OverWriteCheck = props => {
  const { setReplaceWithoutConfirmation, state } = useContext(SearchContext)

  const change = e => {
    setReplaceWithoutConfirmation(e.target.checked)
  }

  return (
    <>
      {state.replaceEnabled ? (
        <div className="search_plugin_find-part">
          <div className="mb-2 remixui_nightlyBuilds custom-control custom-checkbox">
            <input
              className="mr-2 custom-control-input"
              id="confirm_replace"
              type="checkbox"
              onChange={change}
            />
            <label
              htmlFor="confirm_replace"
              data-id="confirm_replace_label"
              className="form-check-label custom-control-label"
            >
              replace without confirmation
            </label>
          </div>
        </div>
      ) : null}
    </>
  )
}
