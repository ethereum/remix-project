import { Ref } from 'react'
import { CompilerAbstract } from '@remix-project/remix-solidity-ts'
import { ContractData, FuncABI } from '@remix-project/core-plugin'
import { ContractList } from '../reducers/runTab'
import { RunTab } from './run-tab'
export interface RunTabProps {
  plugin: RunTab
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
  setExecutionContext: (executionContext: { context: string, fork: string }) => void,
  createNewBlockchainAccount: (cbMessage: JSX.Element) => void,
  setPassphrase: (passphrase: string) => void,
  setMatchPassphrase: (passphrase: string) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  tooltip: (toasterMsg: string) => void,
  signMessageWithAddress: (account: string, message: string, modalContent: (hash: string, data: string) => JSX.Element, passphrase?: string) => void,
  passphrase: string,
  setSendValue: (value: string) => void
}

export interface EnvironmentProps {
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
  personalMode: boolean,
  createNewBlockchainAccount: (cbMessage: JSX.Element) => void,
  setPassphrase: (passphrase: string) => void,
  setMatchPassphrase: (passphrase: string) => void,
  tooltip: (toasterMsg: string) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  signMessageWithAddress: (account: string, message: string, modalContent: (hash: string, data: string) => JSX.Element, passphrase?: string) => void,
  passphrase: string
}

export interface GasPriceProps {
  gasLimit: number,
  setGasFee: (value: number) => void
}

export interface ValueProps {
  setUnit: (unit: 'ether' | 'finney' | 'gwei' | 'wei') => void,
  setSendValue: (value: string) => void,
  sendValue: string,
  sendUnit: string
}

export interface Tx {
  from: string,
  to: string,
  data: string,
  gas: string
}

export interface Network {
  name: string,
  lastBlock: {
    baseFeePerGas: string
  }
}

export type MainnetPrompt = (
  tx: Tx, network:
  Network, amount: string,
  gasEstimation: string,
  gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void,
  determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void
  ) => JSX.Element

export interface ContractDropdownProps {
  exEnvironment: string,
  contracts: {
    contractList: ContractList,
    deployOptions: DeployOptions,
    loadType: 'abi' | 'sol' | 'other',
    currentFile: string,
    currentContract: string,
    compilationCount: number,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  getSelectedContract: (contractName: string, compiler: CompilerAbstract) => ContractData,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  passphrase: string,
  setPassphrase: (passphrase: string) => void,
  createInstance: (
    selectedContract: ContractData,
    gasEstimationPrompt: (msg: string) => JSX.Element,
    passphrasePrompt: (msg: string) => JSX.Element,
    publishToStorage: (storage: 'ipfs' | 'swarm',
    contract: ContractData) => void,
    mainnetPrompt: MainnetPrompt,
    isOverSizePrompt: () => JSX.Element,
    args,
    deployMode: DeployMode[]) => void,
  ipfsCheckedState: boolean,
  setIpfsCheckedState: (value: boolean) => void,
  publishToStorage: (storage: 'ipfs' | 'swarm', contract: ContractData) => void,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (message: string) => JSX.Element,
  mainnetPrompt: (tx: Tx, network: Network, amount: string, gasEstimation: string, gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void, determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void) => JSX.Element,
  tooltip: (toasterMsg: string | JSX.Element) => void,
  loadAddress: (contract: ContractData, address: string) => void,
  networkName: string,
  setNetworkName: (name: string) => void,
  setSelectedContract: (contractName: string) => void
}

export interface RecorderProps {
  storeScenario: (prompt: (msg: string, defaultValue: string) => JSX.Element) => void,
  runCurrentScenario: (liveMode: boolean, gasEstimationPrompt: (msg: string) => JSX.Element, passphrasePrompt: (msg: string) => JSX.Element, confirmDialogContent: MainnetPrompt) => void,
  mainnetPrompt: MainnetPrompt,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (msg: string) => JSX.Element,
  scenarioPrompt: (msg: string, defaultValue: string) => JSX.Element,
  count: number
}

export interface InstanceContainerProps {
  instances: {
    instanceList: {
      contractData?: ContractData,
      address: string,
      name: string,
      decodedResponse?: Record<number, any>,
      abi?: any
    }[],
    error: string
  },
  clearInstances: () => void,
  removeInstance: (index: number) => void,
  getContext: () => 'memory' | 'blockchain',
  runTransactions: (
    instanceIndex: number,
    lookupOnly: boolean,
    funcABI: FuncABI,
    inputsValues: string,
    contractName: string,
    contractABI, contract,
    address,
    logMsg:string,
    mainnetPrompt: MainnetPrompt,
    gasEstimationPrompt: (msg: string) => JSX.Element,
    passphrasePrompt: (msg: string) => JSX.Element,
    funcIndex?: number) => void,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (message: string) => JSX.Element,
  mainnetPrompt: (tx: Tx, network: Network, amount: string, gasEstimation: string, gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void, determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void) => JSX.Element,
  sendValue: string,
  getFuncABIInputs: (funcABI: FuncABI) => string
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

export type DeployMode = 'Deploy with Proxy' | 'Upgrade Proxy'

export type DeployOption = {
  initializeInputs: string,
  inputs: {
    inputs: {
      internalType?: string,
      name: string,
      type: string
    }[],
    name: "initialize",
    outputs?: any[],
    stateMutability: string,
    type: string,
    payable?: boolean,
    constant?: any
  }
}
export interface DeployOptions {
  initializeOptions: {
    [key: string]: DeployOption
  },
  options: { title: DeployMode, active: boolean }[],
}

export interface ContractGUIProps {
  title?: string,
  funcABI: FuncABI,
  inputs: string,
  clickCallBack: (inputs: { name: string, type: string }[], input: string, deployMode?: DeployMode[]) => void,
  widthClass?: string,
  evmBC: any,
  lookupOnly: boolean,
  disabled?: boolean,
  isDeploy?: boolean,
  deployOption?: { title: DeployMode, active: boolean }[],
  initializerOptions?: DeployOption
}
export interface MainnetProps {
  network: Network,
  tx: Tx,
  amount: string,
  gasEstimation: string,
  setNewGasPrice: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void,
  updateGasPriceStatus: (status: boolean) => void,
  updateConfirmSettings: (confirmation: boolean) => void,
  updateMaxFee: (fee: string) => void,
  updateBaseFeePerGas: (fee: string) => void,
  init: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void,
  setTxFeeContent: (content: string) => void,
  updateGasPrice: (price: string) => void,
  updateMaxPriorityFee: (fee: string) => void
  txFeeContent: string,
  maxFee: string,
  maxPriorityFee: string
}

export interface UdappProps {
  instance: {
    contractData?: ContractData,
    address: string,
    name: string,
    decodedResponse?: Record<number, any>,
    abi?: any
  },
  context: 'memory' | 'blockchain',
  removeInstance: (index: number) => void,
  index: number,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (message: string) => JSX.Element,
  mainnetPrompt: (tx: Tx, network: Network, amount: string, gasEstimation: string, gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void, determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void) => JSX.Element,
  runTransactions: (
    instanceIndex: number,
    lookupOnly: boolean,
    funcABI: FuncABI,
    inputsValues: string,
    contractName: string,
    contractABI, contract,
    address,
    logMsg:string,
    mainnetPrompt: MainnetPrompt,
    gasEstimationPrompt: (msg: string) => JSX.Element,
    passphrasePrompt: (msg: string) => JSX.Element,
    funcIndex?: number) => void,
  sendValue: string,
  getFuncABIInputs: (funcABI: FuncABI) => string
}

export interface DeployButtonProps {
  deployOptions: { title: DeployMode, active: boolean }[],
  buttonOptions: {
    title: string,
    content: string,
    classList: string,
    dataId: string,
    widthClass: string
  },
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  handleActionClick: () => void
}

export interface DeployInputProps {
  funcABI: FuncABI,
  inputs: string,
  handleBasicInput: (e) => void,
  basicInputRef: Ref<HTMLInputElement>,
  buttonOptions: {
    title: string,
    content: string,
    classList: string,
    dataId: string,
    widthClass: string
  },
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  handleActionClick: (fields?: HTMLInputElement[]) => void,
  deployOptions: { title: DeployMode, active: boolean }[]
}

export interface MultiDeployInputProps {
  deployOptions?: { title: DeployMode, active: boolean }[],
  buttonOptions: {
    title: string,
    content: string,
    classList: string,
    dataId: string,
    widthClass: string
  },
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  handleMultiValsSubmit: (fields?: HTMLInputElement[]) => void,
  inputs: {
    internalType?: string,
    name: string,
    type: string
  }[],
  getMultiValsString: (fields: HTMLInputElement[]) => void
}
