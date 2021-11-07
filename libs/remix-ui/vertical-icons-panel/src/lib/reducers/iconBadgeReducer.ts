/* eslint-disable @typescript-eslint/no-unused-vars */
import helper from 'apps/remix-ide/src/lib/helper'
import { BadgeStatus, IconStatus } from '../components/Icon'
import React from 'react'

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
function setIconStatus (name: string, status: IconStatus, ref: React.MutableRefObject<any>) {
  const statusEl = ref.current.querySelector('i')
  if (statusEl) {
    ref.current.removeChild(statusEl) // need to eject component instead of removing?
  }
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } else thisType = helper.checkSpecialChars(status.type) ? '' : status.type!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const title = helper.checkSpecialChars(status.title) ? '' : status.title
  // ref.current.classList.add('remixui_icon')
  return { title, type: thisType, key, text }
}

export function iconBadgeReducer (state: BadgeStatus, action: IconBadgeReducerAction) {
  const status = setIconStatus(action.type, action.payload.status, action.payload.ref)
  if (action.type.length > 0) {
    console.log(`from reducer of ${action.type} :`, { status })
    return status
  }
  return state
}
