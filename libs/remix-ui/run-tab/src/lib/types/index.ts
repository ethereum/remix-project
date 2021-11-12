export interface RunTabProps {
  plugin: any
}

export interface SettingsProps {
  selectExEnv: string,
  updateExEnv: (env: string) => void,
  accounts: {
    loadedAccounts: Record<string, any>,
    selectedAccount: string,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  setAccount: (account: string) => void,
  setUnit: (unit: 'ether' | 'finney' | 'gwei' | 'wei') => void,
  sendValue: string,
  sendUnit: string,
  gasLimit: number,
  setGasFee: (value: number) => void
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
    selectedAccount: string,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  setAccount: (account: string) => void
}

export interface GasPriceProps {
  gasLimit: number,
  setGasFee: (value: number) => void
}

export interface ValueProps {
  setUnit: (unit: 'ether' | 'finney' | 'gwei' | 'wei') => void,
  sendValue: string,
  sendUnit: string
}

export interface ContractDropdownProps {
  exEnvironment: string
}

export interface RecorderProps {

}

export interface InstanceContainerProps {

}
