export const defaultState: {
  key: string | number
  title: string
  type: string
  text: string
} = { key: '', title: '', type: '', text: '' }

function iconStatusReducer (state, action: any) {
  return defaultState
}
