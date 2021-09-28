/* eslint-disable @typescript-eslint/no-unused-vars */
import { profile } from '@remix-ui/vertical-icons'
import { Profile } from '@remixproject/plugin-utils'
// import helper from '../../../../../../apps/remix-ide/src/lib/helper'
import {
  defaultModuleProfile,
  PassedProfile,
  VerticalIcons
} from 'libs/remix-ui/vertical-icons/types/vertical-icons'
// const types = []
export type ResolveClassesActionKey = {
  key: 'edited' | 'succeed' | 'none' | 'loading' | 'failed'
  types: 'error' | 'warning' | 'success' | 'info' | ''
}

export function resolveClassesReducer(
  currentState: string,
  resolveActionKind: ResolveClassesActionKey
) {
  let newState = currentState
  switch (resolveActionKind.key) {
    case 'succeed':
      newState += ` fas fa-check-circle text-${resolveActionKind.key} statusCheck`
      break
    case 'edited':
      newState += ` fas fa-sync text-${resolveActionKind.key} statusCheck`
      break
    case 'loading':
      newState += ` fas fa-spinner text-${resolveActionKind.key} statusCheck`
      break
    case 'failed':
      newState += ` fas fa-exclamation-triangle text-${resolveActionKind.key} statusCheck`
      break
    default: {
      newState += ` badge badge-pill badge-${resolveActionKind.key}`
    }
  }
  return newState
}

type listenOnStatusReducerActions = {}

const keys = ['edited', 'succeed', 'none', 'loading', 'failed']
const types = ['error', 'warning', 'success', 'info', '']
const mutateIconStatus = (
  status: any,
  types: string[],
  keys: string[],
  profile: defaultModuleProfile,
  verticalIconsPlugin: VerticalIcons
) => {
  if (!types.includes(status.type) && status.type)
    throw new Error(`type should be ${keys.join()}`)
  if (status.key === undefined) throw new Error('status key should be defined')

  if (typeof status.key === 'string' && !keys.includes(status.key)) {
    throw new Error('key should contain either number or ' + keys.join())
  }
  verticalIconsPlugin.setIconStatus(profile.name, status)
}

export function listenOnStatusReducer() {

}

type ListenOnStatus = {
  key: string,
  type: string
}

// /**
//    * Set a new status for the @arg name
//    * @param {String} name
//    * @param {Object} status
//    */
// function setIconStatus (name: string, status: any) {
//   const el = this.icons[name] // current icon selected
//   if (!el) return
//   const statusEl = el.querySelector('i')
//   if (statusEl) {
//     el.removeChild(statusEl)
//   }
//   if (status.key === 'none') return // remove status

//   let text = ''
//   let key = ''
//   if (typeof status.key === 'number') {
//     key = status.key.toString()
//     text = key
//   } else key = helper.checkSpecialChars(status.key) ? '' : status.key

//   let type = ''
//   if (status.type === 'error') {
//     type = 'danger' // to use with bootstrap
//   } else type = helper.checkSpecialChars(status.type) ? '' : status.type
//   const title = helper.checkSpecialChars(status.title) ? '' : status.title

//   el.appendChild(yo`<i
//   title="${title}"
//     class="${this.resolveClasses(key, type)}"
//     aria-hidden="true"    console.log('in verticalIcons constructor!')
//   >
//   ${text}
//   </i>`)

//   el.classList.add(`${css.icon}`)
// }

function listenOnStatus (profile: Profile) {
  // the list of supported keys. 'none' will remove the status
  const keys = ['edited', 'succeed', 'none', 'loading', 'failed']
  const types = ['error', 'warning', 'success', 'info', '']
  const fn = (status: ListenOnStatus) => {
    if (!types.includes(status.type) && status.type) throw new Error(`type should be ${keys.join()}`)
    if (status.key === undefined) throw new Error('status key should be defined')

    if (typeof status.key === 'string' && (!keys.includes(status.key))) {
      throw new Error('key should contain either number or ' + keys.join())
    }
    this.setIconStatus(profile.name, status)
  }
  this.iconStatus[profile.name] = fn
  this.on(profile.name, 'statusChanged', this.iconStatus[profile.name])
}
