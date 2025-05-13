import React from 'react'
import { CustomTooltip } from '@remix-ui/helper'

export const CompileStatusPanel = ({ loading, queuePosition, checkQueueStatus }) => {
  if (!loading) return null
  return (
    <div className="mt-3">
      <button className="btn btn-outline-primary btn-sm" onClick={checkQueueStatus}>
        Check Compile Order
      </button>
      {queuePosition !== null && (
        <div className="remixui_alert remixui_alert-info mt-2" style={{ fontFamily: 'Menlo, Monaco, Consolas', fontSize: '12px' }}>
          You're currently <strong>#{queuePosition + 1}</strong> in the queue.
        </div>
      )}
    </div>
  )
}
