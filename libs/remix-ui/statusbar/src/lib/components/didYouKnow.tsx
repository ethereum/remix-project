import { CustomTooltip } from '@remix-ui/helper'
import React from 'react'

export default function DidYouKnow () {
  return (
    <CustomTooltip tooltipText={'Did you know'}>
      <div className="remixui_statusbar_didyouknow text-white small d-flex align-items-center">
        <span className="pr-2 far fa-exclamation-triangle text-white fa-regular fa-lightbulb"></span>
        <div>Did you know?</div>
      </div>
    </CustomTooltip>
  )
}
