/* eslint-disable @typescript-eslint/no-unused-vars */
import helper from 'apps/remix-ide/src/lib/helper'
import { BadgeStatus, IconStatus } from '../components/Icon'
import React, { MutableRefObject } from 'react'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'

export type IconBadgeReducerAction = {
  readonly type: string
  readonly payload: any
}

/**
   * Set a new status for the @arg name
   * @param {String} name
   * @param {Object} status
   */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setIconStatus (name: string, status: IconStatus) {
  if (status.key === 'none') return { ...status, text: '' } // remove status

  let text = ''
  let key = ''
  if (typeof status.key === 'number') {
    key = status.key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    text = key
  } else key = helper.checkSpecialChars(status.key) ? '' : status.key

  let thisType = ''
  if (status.type === 'error') {
    thisType = 'danger' // to use with bootstrap
  } else thisType = helper.checkSpecialChars(status.type) ? '' : status.type!
  const title = helper.checkSpecialChars(status.title) ? '' : status.title
  return { title, type: thisType, key, text }
}

export function iconBadgeReducer (state: BadgeStatus, action: IconBadgeReducerAction) {
  const { status, ref, verticalIconPlugin } = action.payload
  if (Object.keys(verticalIconPlugin.targetProfileForChange).includes(action.type)) {
    const setStatus = setIconStatus(action.type, status)
    return setStatus
  }
  return state
}
