
export type actionType = {
  type: 'resize' | 'other'
  payload: any
}

export function verticalScrollReducer (prevState: any, actionPayload: actionType) {
  if (actionPayload.type === 'resize') {
    const { scrollHeight, clientHeight } = actionPayload.payload
    let { scrollState } = actionPayload.payload
    if (scrollHeight > clientHeight) scrollState = true
    return { scrollHeight, clientHeight, scrollState }
  }
  return prevState
}
