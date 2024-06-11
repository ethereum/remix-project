import { defaultLoaderState, loaderState } from "../types";

interface Action {
  type: string
  payload: any
}

export const loaderReducer = (state: loaderState = defaultLoaderState, action: Action): loaderState => {
  state[action.type] = action.payload
  return state
}