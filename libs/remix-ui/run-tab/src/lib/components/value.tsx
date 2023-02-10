// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { BN } from 'bn.js'
import { CustomTooltip, isNumeric } from '@remix-ui/helper'
import { ValueProps } from '../types'

export function ValueUI (props: ValueProps) {
  const [sendValue, setSendValue] = useState<string>(props.sendValue)
  const inputValue = useRef<HTMLInputElement>({} as HTMLInputElement)

  useEffect(() => {
    (sendValue !== props.sendValue) && props.setSendValue(sendValue)
  }, [sendValue])

  const validateInputKey = (e) => {
    // preventing not numeric keys
    // preventing 000 case
    if (!isNumeric(e.key) ||
      (e.key === '0' && !parseInt(inputValue.current.value) && inputValue.current.value.length > 0)) {
      e.preventDefault()
    }
  }

  const validateValue = (e) => {
    const value = e.target.value

    if (!value) {
      // assign 0 if given value is
      // - empty
      return setSendValue('0')
    }

    let v
    try {
      v = new BN(value, 10)
      setSendValue(v.toString(10))
    } catch (e) {
      // assign 0 if given value is
      // - not valid (for ex 4345-54)
      // - contains only '0's (for ex 0000) copy past or edit
      setSendValue('0')
    }

    // if giveen value is negative(possible with copy-pasting) set to 0
    if (v.lt(0)) setSendValue('0')
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel" data-id="remixDRValueLabel"><FormattedMessage id='udapp.value' /></label>
      <div className="udapp_gasValueContainer">
        <CustomTooltip
          placement={'top-start'}
          tooltipClasses="text-nowrap"
          tooltipId="remixValueTooltip"
          tooltipText="Enter an amount and choose its unit"
        >
        <input
          ref={inputValue}
          type="number"
          min="0"
          pattern="^[0-9]"
          step="1"
          className="form-control udapp_gasNval udapp_col2"
          id="value"
          data-id="dandrValue"
          onKeyPress={validateInputKey}
          onChange={validateValue}
          value={props.sendValue}
        />
      </CustomTooltip>

        <select name="unit"
        value={props.sendUnit} className="form-control p-1 udapp_gasNvalUnit udapp_col2_2 custom-select" id="unit" onChange={(e) => { props.setUnit((e.target.value) as 'ether' | 'finney' | 'gwei' | 'wei') }}>
          <option data-unit="wei" value='wei'>Wei</option>
          <option data-unit="gwei" value="gwei">Gwei</option>
          <option data-unit="finney" value="finney">Finney</option>
          <option data-unit="ether" value="ether">Ether</option>
        </select>
      </div>
    </div>
  )
}
