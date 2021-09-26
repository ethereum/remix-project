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

export function listenOnStatusReducer() {}

function onThemeChanged (themeType) {
  const invert = themeType === 'dark' ? 1 : 0
  const active = this.view.querySelector('.active')
  if (active) {
    const image = active.querySelector('.image')
    image.style.setProperty('filter', `invert(${invert})`)
  }
}

type ThemeChangeActionType = {
  themeType: 'dark' | 'light',
  payload: any
}

export function ThemeChangeReducer (defaultValue: any, themeAction: ThemeChangeActionType) {
  let invert = 0
  if (themeAction.themeType === 'dark') {
    invert = 1
  }
  const active = document.querySelector('.active')
}
