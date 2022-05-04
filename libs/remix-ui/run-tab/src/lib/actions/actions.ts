import { ContractData } from "@remix-project/core-plugin"
import { addNewInstance, addProvider, clearAllInstances, clearRecorderCount, hidePopUp, removeExistingInstance, removeProvider, setBaseFeePerGas, setConfirmSettings, setCurrentContract, setExecutionEnvironment, setExternalEndpoint, setGasLimit, setGasPrice, setGasPriceStatus, setMatchPassphrase, setMaxFee, setMaxPriorityFee, setNetworkName, setPassphrase, setPathToScenario, setSelectedAccount, setSendUnit, setSendValue, setTxFeeContent } from "./payload"

export const setAccount = (dispatch: React.Dispatch<any>, account: string) => {
  dispatch(setSelectedAccount(account))
}

export const setUnit = (dispatch: React.Dispatch<any>, unit: 'ether' | 'finney' | 'gwei' | 'wei') => {
  dispatch(setSendUnit(unit))
}

export const setGasFee = (dispatch: React.Dispatch<any>, value: number) => {
  dispatch(setGasLimit(value))
}

export const setExecEnv = (dispatch: React.Dispatch<any>, env: string) => {
  dispatch(setExecutionEnvironment(env))
}

export const setNetworkNameFromProvider = (dispatch: React.Dispatch<any>, networkName: string) => {
  dispatch(setNetworkName(networkName))
}

export const addExternalProvider = (dispatch: React.Dispatch<any>, network) => {
  dispatch(addProvider(network))
}

export const removeExternalProvider = (dispatch: React.Dispatch<any>, name) => {
  dispatch(removeProvider(name))
}

export const clearPopUp = async (dispatch: React.Dispatch<any>) => {
  dispatch(hidePopUp())
}

export const setPassphrasePrompt = (dispatch: React.Dispatch<any>, passphrase: string) => {
  dispatch(setPassphrase(passphrase))
}

export const setMatchPassphrasePrompt = (dispatch: React.Dispatch<any>, passphrase: string) => {
  dispatch(setMatchPassphrase(passphrase))
}

export const updateGasPriceStatus = (dispatch: React.Dispatch<any>, status: boolean) => {
  dispatch(setGasPriceStatus(status))
}

export const updateConfirmSettings = (dispatch: React.Dispatch<any>, confirmation: boolean) => {
  dispatch(setConfirmSettings(confirmation))
}

export const updateMaxFee = (dispatch: React.Dispatch<any>, fee: string) => {
  dispatch(setMaxFee(fee))
}

export const updateMaxPriorityFee = (dispatch: React.Dispatch<any>, fee: string) => {
  dispatch(setMaxPriorityFee(fee))
}

export const updateBaseFeePerGas = (dispatch: React.Dispatch<any>, baseFee: string) => {
  dispatch(setBaseFeePerGas(baseFee))
}

export const updateGasPrice = (dispatch: React.Dispatch<any>, price: string) => {
  dispatch(setGasPrice(price))
}

export const updateTxFeeContent = (dispatch: React.Dispatch<any>, content: string) => {
  dispatch(setTxFeeContent(content))
}

export const addInstance = (dispatch: React.Dispatch<any>, instance: { contractData?: ContractData, address: string, name: string, abi?: any, decodedResponse?: Record<number, any> }) => {
  instance.decodedResponse = {}
  dispatch(addNewInstance(instance))
}

export const removeInstance = (dispatch: React.Dispatch<any>, index: number) => {
  dispatch(removeExistingInstance(index))
}

export const clearInstances = (dispatch: React.Dispatch<any>) => {
  dispatch(clearAllInstances())
  dispatch(clearRecorderCount())
}

export const setSelectedContract = (dispatch: React.Dispatch<any>, contractName: string) => {
  dispatch(setCurrentContract(contractName))
}

export const updateScenarioPath = (dispatch: React.Dispatch<any>, path: string) => {
  dispatch(setPathToScenario(path))
}

export const setSendTransactionValue = (dispatch: React.Dispatch<any>, value: string) => {
  dispatch(setSendValue(value))
}