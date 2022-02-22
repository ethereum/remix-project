import React, { useContext, useEffect, useRef, useState } from 'react'
import { SearchContext } from '../context/context'

export const OverWriteCheck = props => {
  const { setReplaceWithoutConfirmation } = useContext(SearchContext)

  const change = e => {
    console.log(e.target.checked)
    setReplaceWithoutConfirmation(e.target.checked)
  }

  return (
    <>
      <div className="find-part">
        <div className="mb-2 remixui_nightlyBuilds custom-control custom-checkbox">
          <input
            className="mr-2 custom-control-input"
            id="confirm_replace"
            type="checkbox"
            onChange={change}
          />
          <label
            htmlFor='confirm_replace'
            data-id="compilerNightliesBuild"
            className="form-check-label custom-control-label"
          >
            replace without confirmation
          </label>
        </div>
      </div>
    </>
  )
}
