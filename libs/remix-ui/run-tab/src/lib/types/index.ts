import { RunTabState } from '../reducers/runTab'
import { Blockchain } from './blockchain'

export interface Udapp {
  onReady: (api: RunTabState) => void,
  REACT_API: RunTabState,
  blockchain: Blockchain
}
export interface RunTabProps {
  plugin: Udapp
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
  networkName: string,
  providers: {
    providerList: {
      id?: string,
      dataId?: string,
      title?: string,
      value: string,
      fork?: string
      content: string
    }[],
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  setExecutionContext: (executionContext: { context: string, fork: string }) => void
}

export interface EnvironmentProps {
  setExecEnv: (env: string) => void,
  selectedEnv: string,
  providers: {
    providerList: {
      id?: string,
      dataId?: string,
      title?: string,
      value: string,
      fork?: string
      content: string
    }[],
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  setExecutionContext: (executionContext: { context: string, fork: string }) => void
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

export interface Modal {
  hide?: boolean
  title: string
  // eslint-disable-next-line no-undef
  message: string | JSX.Element
  okLabel: string
  okFn: () => void
  cancelLabel: string
  cancelFn: () => void
}
