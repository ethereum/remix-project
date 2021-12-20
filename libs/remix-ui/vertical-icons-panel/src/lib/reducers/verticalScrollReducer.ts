
export type actionType = {
  type: 'resize' | 'other'
  payload: any
}

export function verticalScrollReducer(prevState: any, actionPayload: actionType) {
  if (actionPayload.type === 'resize') {
    actionPayload.payload.scrollHeight > actionPayload.payload.clientHeight
    console.log(`values being checked are ${actionPayload.payload.scrollHeight} > ${actionPayload.payload.clientHeight}`)
    const newvals = actionPayload.payload
    return { ...newvals }
  } else if (actionPayload.type === 'other') {
    actionPayload.payload.scrollHeight > actionPayload.payload.clientHeight
  }
  return prevState
}