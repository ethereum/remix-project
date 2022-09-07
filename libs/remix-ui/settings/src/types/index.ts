export interface GithubSettingsProps {
  saveToken: (githubToken: string, githubUserName: string, githubEmail: string) => void,
  removeToken: () => void,
  config: {
    exists: (key: string) => boolean,
    get: (key: string) => string,
    set: (key: string, content: string) => void,
    clear: () => void,
    getUnpersistedProperty: (key: string) => void,
    setUnpersistedProperty: (key: string, value: string) => void
  }
}

export interface EtherscanSettingsProps {
  saveToken: (etherscanToken: string) => void,
  removeToken: () => void,
  config: {
    exists: (key: string) => boolean,
    get: (key: string) => string,
    set: (key: string, content: string) => void,
    clear: () => void,
    getUnpersistedProperty: (key: string) => void,
    setUnpersistedProperty: (key: string, value: string) => void
  }
}
