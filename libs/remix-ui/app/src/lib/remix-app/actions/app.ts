import { branch, GitHubUser } from '@remix-api';
import { AppModal } from '../interface'

type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
      ? {
          type: Key;
        }
      : {
          type: Key;
          payload: M[Key];
        }
}

export const enum appActionTypes {
  setGitHubUser = 'SET_GITHUB_USER',
  setCurrentBranch = 'SET_CURRENT_BRANCH',
  setNeedsGitInit = 'SET_NEEDS_GIT_INIT',
  setCanUseGit = 'SET_CAN_USE_GIT',
  setShowPopupPanel = 'SET_SHOW_POPUP_PANEL',
}

type AppPayload = {
  [appActionTypes.setGitHubUser]: GitHubUser,
  [appActionTypes.setCurrentBranch]: branch,
  [appActionTypes.setNeedsGitInit]: boolean,
  [appActionTypes.setCanUseGit]: boolean,
  [appActionTypes.setShowPopupPanel]: boolean,
}

export type AppAction = ActionMap<AppPayload>[keyof ActionMap<
  AppPayload
>]
