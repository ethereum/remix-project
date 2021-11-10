export interface RunTabProps {
  plugin: any
}

export interface SettingsProps {
  selectExEnv: string,
  updateExEnv: (env: string) => void,
  accounts: {
    loadedAccounts: Record<string, any>,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  }
}

export interface EnvironmentProps {
  updateExEnv: (env: string) => void
}

export interface NetworkProps {

}

export interface AccountProps {
  selectExEnv: string,
  accounts: {
    loadedAccounts: Record<string, any>,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  }
}

export interface GasPriceProps {

}

export interface ValueProps {

}

export interface ContractDropdownProps {
  exEnvironment: string
}

export interface RecorderProps {

}

export interface InstanceContainerProps {

}
