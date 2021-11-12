// eslint-disable-next-line no-use-before-define
import React, { useRef } from 'react'
import { BN } from 'ethereumjs-util'
import { isNumeric } from '@remix-ui/helper'
import { ValueProps } from '../types'

export function ValueUI (props: ValueProps) {
  const inputValue = useRef(null)

  const validateInputKey = (e) => {
    // preventing not numeric keys
    // preventing 000 case
    if (!isNumeric(e.key) ||
      (e.key === '0' && !parseInt(inputValue.current.value) && inputValue.current.value.length > 0)) {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
  }

  const validateValue = () => {
    if (!inputValue.current.value) {
      // assign 0 if given value is
      // - empty
      inputValue.current.value = 0
      return
    }

    let v
    try {
      v = new BN(inputValue.current.value, 10)
      inputValue.current.value = v.toString(10)
    } catch (e) {
      // assign 0 if given value is
      // - not valid (for ex 4345-54)
      // - contains only '0's (for ex 0000) copy past or edit
      inputValue.current.value = 0
    }

    // if giveen value is negative(possible with copy-pasting) set to 0
    if (v.lt(0)) inputValue.current.value = 0
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel" data-id="remixDRValueLabel">Value</label>
      <div className="udapp_gasValueContainer">
        <input
          type="number"
          min="0"
          pattern="^[0-9]"
          step="1"
          className="form-control udapp_gasNval udapp_col2"
          id="value"
          data-id="dandrValue"
          value={props.sendValue}
          title="Enter the value and choose the unit"
          onKeyPress={validateInputKey}
          onChange={validateValue}
        />
        <select name="unit" value={props.sendUnit} className="form-control p-1 udapp_gasNvalUnit udapp_col2_2 custom-select" id="unit" onChange={(e) => { props.setUnit((e.target.value) as 'ether' | 'finney' | 'gwei' | 'wei') }}>
          <option data-unit="wei">Wei</option>
          <option data-unit="gwei">Gwei</option>
          <option data-unit="finney">Finney</option>
          <option data-unit="ether">Ether</option>
        </select>
      </div>
    </div>
  )
}
