
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
