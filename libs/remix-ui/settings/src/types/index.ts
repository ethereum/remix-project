export interface GithubSettingsProps {
  saveTokenToast: (githubToken: string, githubUserName: string, githubEmail: string) => void,
  removeTokenToast: () => void
}
