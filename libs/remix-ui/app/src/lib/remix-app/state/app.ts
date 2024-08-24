import { GitHubUser } from "@remix-ui/git";
import { AppState } from "../interface";

export const appInitialState: AppState = {
  gitHubUser: {} as GitHubUser,
}