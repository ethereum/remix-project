/* eslint-disable @typescript-eslint/no-unused-vars */
import { profile } from '@remix-ui/vertical-icons'
import { defaultModuleProfile, PassedProfile } from 'libs/remix-ui/vertical-icons/types/vertical-icons'
// const types = []
export type ResolveClassesActionKey = {
    key: 'edited' | 'succeed' | 'none' | 'loading' | 'failed'
    payloadTypes: 'error' | 'warning' | 'success' | 'info' | ''
}

export function resolveClassesReducer (currentState: string, resolveActionKind: ResolveClassesActionKey) {
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

export type LinkContentActions = {
  type: ''
  payload?: any
}

export function linkContentReducer (currentProfile: PassedProfile[], linkContentActions: LinkContentActions) {
  const mutableProfile = currentProfile
  if (mutableProfile && mutableProfile.length > 0) {
    console.log('there was a change in length!')
    return mutableProfile
  }
  return currentProfile
}
