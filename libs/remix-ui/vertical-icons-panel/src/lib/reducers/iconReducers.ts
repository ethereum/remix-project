export const defaultState: {
  key: string | number
  title: string
  type: string
  text: string
  profileName: string
  errorStatus: () => void
} = { key: '', title: '', type: '', text: '', profileName: '', errorStatus: () => {} }

export type IconStatusActionType = {
  type: 'success' | 'warning' | 'error' | 'info' | ''
  payload?: any
}

/** status: { key: string | number, title: string, type: string }
   * resolve a classes list for @arg key
   * @param {String} key
   * @param {String} type
   */
export function resolveClasses (key: string, type: string) {
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

export function iconStatusReducer (state, action: IconStatusActionType) {
  const { type, payload } = action
  if (type === 'success') {
    
  }
  return defaultState
}
