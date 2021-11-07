/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line no-use-before-define
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useReducer } from 'react'
import { iconBadgeReducer, IconBadgeReducerAction } from '../reducers/iconBadgeReducer'
import { BadgeStatus, IconProfile, IconStatus } from './Icon'

interface BadgeProps {
  verticalIconPlugin: VerticalIcons
  iconRef: React.MutableRefObject<any>
  profile: IconProfile,
  badgeStatus: BadgeStatus
}

// eslint-disable-next-line no-undef
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Badge ({ iconRef, verticalIconPlugin, profile, badgeStatus }: BadgeProps) {
  /**
   * resolve a classes list for @arg key
   * @param {Object} key
   * @param {Object} type
   */
  function resolveClasses (key: string, type: string) {
    let classes = 'remixui_status'
    switch (key) {
      case 'succeed':
        classes += ' fas fa-check-circle text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'edited':
        classes += ' fas fa-sync text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'loading':
        classes += ' fas fa-spinner text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'failed':
        classes += ' fas fa-exclamation-triangle text-' + type + ' ' + 'remixui_statusCheck'
        break
      default: {
        classes += ' badge badge-pill badge-' + type
      }
    }
    return classes
  }

  return (
    <i
      title={badgeStatus.title}
      className={`${resolveClasses(badgeStatus.key, badgeStatus.type!)} remixui_status`}
      aria-hidden="true"
    >
      {badgeStatus.text}
    </i>
  )
}

export default Badge
