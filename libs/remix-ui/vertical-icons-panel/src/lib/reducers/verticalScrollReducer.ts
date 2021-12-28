
export type actionType = {
  type: 'resize' | 'other'
  payload: any
}

export function verticalScrollReducer (prevState: any, actionPayload: actionType) {
  if (actionPayload.type === 'resize') {
    console.log(`values being checked are ${actionPayload.payload.scrollHeight} > ${actionPayload.payload.clientHeight}`)
    let { scrollHeight, clientHeight, scrollState } = actionPayload.payload
    if (scrollHeight > clientHeight) scrollState = true
    return { scrollHeight, clientHeight, scrollState }
  }
  return prevState
}
