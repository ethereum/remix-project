import { GitHubUser } from '@remix-api';
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
}

type AppPayload = {
  [appActionTypes.setGitHubUser]: GitHubUser
}

export type AppAction = ActionMap<AppPayload>[keyof ActionMap<
  AppPayload
>]
