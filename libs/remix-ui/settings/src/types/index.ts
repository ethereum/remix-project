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

export interface SindriSettingsProps {
  saveToken: (sindriToken: string) => void,
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

export interface SettingsSection {
  key: string
  label: string
  decription: string,
  subSections: {
    title?: string,
    options: {
      name: string,
      label: string,
      labelIcon?: string,
      description?: string,
      footnote?: {
        text: string,
        link?: string,
        styleClass?: string
      },
      type: 'toggle' | 'select' | 'button',
      selectOptions?: {
        label: string,
        value: string
      }[],
      toggleOptions?: JSX.Element
    }[]
  }[]
}

interface SettingsStateToggle {
  value: boolean,
  isLoading: boolean
}
interface SettingsStateInput {
  value: string,
  isLoading: boolean
}

interface SettingsStateSelect {
  value: string,
  isLoading: boolean
}

export interface SettingsState {
  'generate-contract-metadata': SettingsStateToggle
  'text-wrap': SettingsStateToggle
  'personal-mode': SettingsStateToggle
  'matomo-perf-analytics': SettingsStateToggle
  'matomo-analytics': SettingsStateToggle
  'auto-completion': SettingsStateToggle
  'show-gas': SettingsStateToggle
  'display-errors': SettingsStateToggle
  'copilot/suggest/activate': SettingsStateToggle
  'copilot/suggest/max_new_tokens': SettingsStateInput
  'copilot/suggest/temperature': SettingsStateInput
  'save-evm-state': SettingsStateToggle,
  'theme': SettingsStateSelect,
  'locale': SettingsStateSelect
}
