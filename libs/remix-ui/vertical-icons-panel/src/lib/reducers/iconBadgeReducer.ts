/* eslint-disable @typescript-eslint/no-unused-vars */
import helper from 'apps/remix-ide/src/lib/helper'
import { BadgeStatus, IconStatus } from '../components/Icon'
import React, { MutableRefObject } from 'react'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'

export type IconBadgeReducerAction = {
  readonly type: string
  readonly payload: any
}

// const fn = (status: IconStatus) => {
//   if (!verticalIconPlugin.types.includes(status.type) && status.type) throw new Error(`type should be ${verticalIconPlugin.keys.join()}`)
//   if (status.key === undefined) throw new Error('status key should be defined')

//   if (typeof status.key === 'string' && (!verticalIconPlugin.keys.includes(status.key))) {
//     throw new Error('key should contain either number or ' + verticalIconPlugin.keys.join())
//   }
// }

/**
   * Set a new status for the @arg name
   * @param {String} name
   * @param {Object} status
   */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// if (!ref.current) return
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
  console.log(`new status for ${name} is :`, { title, type: thisType, key, text })
  return { title, type: thisType, key, text }
}

export function iconBadgeReducer (state: BadgeStatus, action: IconBadgeReducerAction) {
  const { status, ref, verticalIconPlugin } = action.payload
  if (Object.keys(verticalIconPlugin.targetProfileForChange).includes(action.type)) {
    const setStatus = setIconStatus(action.type, status)
    console.log(`from reducer of ${action.type} :`, { setStatus })
    return setStatus
  }
  return state
}
