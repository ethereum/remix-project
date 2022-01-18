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
  setWeb3Endpoint: (endpoint: string) => void,
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
  setExecutionContext: (executionContext: { context: string, fork: string }, displayContent: JSX.Element) => void,
  createNewBlockchainAccount: (cbMessage: JSX.Element) => void,
  setPassphrase: (passphrase: string) => void,
  setMatchPassphrase: (passphrase: string) => void,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  tooltip: (toasterMsg: string) => void,
  signMessageWithAddress: (account: string, message: string, modalContent: (hash: string, data: string) => JSX.Element, passphrase?: string) => void,
  passphrase: string,
  web3ProviderDialog: () => JSX.Element,
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
  setExecutionContext: (executionContext: { context: string, fork: string }, displayContent: JSX.Element) => void,
  web3ProviderDialog: () => JSX.Element
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

export interface FuncABI {
  name: string,
  type: string,
  inputs: { name: string, type: string }[],
  stateMutability: string,
  payable: boolean,
  constant: any
}
export interface ContractData {
  name: string,
  contract: any,
  compiler: any,
  abi: FuncABI[],
  bytecodeObject: any,
  bytecodeLinkReferences: any,
  object: any,
  deployedBytecode: any,
  getConstructorInterface: () => any,
  getConstructorInputs: () => any,
  isOverSizeLimit: () => boolean,
  metadata: any
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
    contractList: {
      name: string,
      alias: string,
      file: string
    }[],
    loadType: 'abi' | 'sol' | 'other',
    currentFile: string,
    compilationCount: number,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  getSelectedContract: (contractName: string, compilerAtributeName: string) => ContractData,
  modal: (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => void,
  passphrase: string,
  setPassphrase: (passphrase: string) => void,
  createInstance: (
    selectedContract: ContractData,
    gasEstimationPrompt: (msg: string) => JSX.Element,
    passphrasePrompt: (msg: string) => JSX.Element,
    logBuilder: (msg: string) => JSX.Element,
    publishToStorage: (storage: 'ipfs' | 'swarm',
    contract: ContractData) => void,
    mainnetPrompt: MainnetPrompt,
    isOverSizePrompt: () => JSX.Element,
    args) => void,
  ipfsCheckedState: boolean,
  setIpfsCheckedState: (value: boolean) => void,
  publishToStorage: (storage: 'ipfs' | 'swarm', contract: ContractData) => void,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  logBuilder: (msg: string) => JSX.Element,
  passphrasePrompt: (message: string) => JSX.Element,
  mainnetPrompt: (tx: Tx, network: Network, amount: string, gasEstimation: string, gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void, determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void) => JSX.Element,
  tooltip: (toasterMsg: string | JSX.Element) => void,
  loadAddress: (contract: ContractData, address: string) => void,
  networkName: string,
  setNetworkName: (name: string) => void
}

export interface RecorderProps {
  storeScenario: (prompt: (msg: string, defaultValue: string) => JSX.Element) => void,
  runCurrentScenario: (gasEstimationPrompt: (msg: string) => JSX.Element, passphrasePrompt: (msg: string) => JSX.Element, confirmDialogContent: MainnetPrompt, logBuilder: (msg: string) => JSX.Element) => void,
  logBuilder: (msg: string) => JSX.Element,
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
    logBuilder: (msg: string) => JSX.Element,
    mainnetPrompt: MainnetPrompt,
    gasEstimationPrompt: (msg: string) => JSX.Element,
    passphrasePrompt: (msg: string) => JSX.Element,
    funcIndex?: number) => void,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  logBuilder: (msg: string) => JSX.Element,
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

export interface ContractGUIProps {
  title?: string,
  funcABI: FuncABI,
  inputs: any,
  clickCallBack: (inputs: { name: string, type: string }[], input: string) => void,
  widthClass?: string,
  evmBC: any,
  lookupOnly: boolean
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
  logBuilder: (msg: string) => JSX.Element,
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
    logBuilder: (msg: string) => JSX.Element,
    mainnetPrompt: MainnetPrompt,
    gasEstimationPrompt: (msg: string) => JSX.Element,
    passphrasePrompt: (msg: string) => JSX.Element,
    funcIndex?: number) => void,
  sendValue: string,
  getFuncABIInputs: (funcABI: FuncABI) => string
}
