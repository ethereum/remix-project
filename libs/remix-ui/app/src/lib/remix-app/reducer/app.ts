import { AppAction, appActionTypes } from "../actions/app";
import { AppState } from "../interface";

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
  case appActionTypes.setGitHubUser:{
    return {
      ...state,
      gitHubUser: action.payload
    }
  }
  }
}