import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'

import './toggle-switch.css'
import { CustomTooltip } from '@remix-ui/helper'

interface IToggleSwitch {
  id: string
  onstyle?: string
  offstyle?: string
  size?: string // lg,xl,2xl etc
  tooltipTextId?: string
  classList?: string
  disabled?: boolean
  initiallyOn?: boolean
}
export const ToggleSwitch = (props: IToggleSwitch) => {
  const { id, onstyle, offstyle, size, tooltipTextId, disabled, initiallyOn} = props
  const [ isOn, setIsOn] = useState(initiallyOn)


  const handleClick = (e: any) => {
  }

  const childJSXWithTooltip = (
      <CustomTooltip
            placement={"auto"}
            tooltipId="matomoAnonAnalyticsTooltip"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="remixApp.mpOp1Tooltip" />}
      >
        <button
          data-id="matomoAnonAnalyticsSwitch"
          id='matomoAnonAnalyticsSwitch'
          className="btn text-ai"
        >
          <i className="fas fa-toggle-on fa-2xl"></i>
        </button>
      </CustomTooltip>
  )

  const childJSXWithoutTooltip = (
      <button
        data-id={ id + "Switch"}
        id='matomoAnonAnalyticsSwitch'
        className="btn text-ai"
      >
        { isOn ? <i className={`fas fa-toggle-on ${size ? `fa-${size}` : "fa-lg"}`}></i> : <i className={`fas fa-toggle-off ${size ? `fa-${size}` : "fa-lg"}`}></i> }
      </button>
  )

  return tooltipTextId ? childJSXWithTooltip : childJSXWithoutTooltip
}

export default ToggleSwitch
