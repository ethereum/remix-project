export interface RunTabProps {
  plugin: any
}

export interface SettingsProps {
  selectExEnv: string,
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
  setGasFee: (value: number) => void,
  setExecEnv: (env: string) => void,
  personalMode: boolean,
  networkName: string
}

export interface EnvironmentProps {
  setExecEnv: (env: string) => void,
  selectedEnv: string
}

export interface NetworkProps {
  networkName: string
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
  setAccount: (account: string) => void,
  personalMode: boolean
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
