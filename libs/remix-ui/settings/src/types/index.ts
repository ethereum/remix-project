export interface GithubSettingsProps {
  saveTokenToast: (githubToken: string, githubUserName: string, githubEmail: string) => void,
  removeTokenToast: () => void,
  config: {
    exists: (key: string) => boolean,
    get: (key: string) => string,
    set: (key: string, content: string) => void,
    clear: () => void,
    getUnpersistedProperty: (key: string) => void,
    setUnpersistedProperty: (key: string, value: string) => void
  }
}
