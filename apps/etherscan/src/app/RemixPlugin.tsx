import {verify, EtherScanReturn} from './utils/verify'
import {getReceiptStatus, getEtherScanApi, getNetworkName, getProxyContractReceiptStatus} from './utils'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { CompilationFileSources, CompilationResult } from '@remixproject/plugin-api'
import { getNewContractNames } from './app'

export class RemixClient extends PluginClient {
  constructor() {
    super()
    createClient(this)
    this.onload().then(async () => {
      // do nothing
    })
  }

  async verify(
    apiKey: string,
    contractAddress: string,
    contractArguments: string,
    contractName: string,
    compilationResultParam: any,
    chainRef?: number | string,
    isProxyContract?: boolean,
    expectedImplAddress?: string
  ) {
    const result = await verify(
      apiKey,
      contractAddress,
      contractArguments,
      contractName,
      compilationResultParam,
      chainRef,
      isProxyContract,
      expectedImplAddress,
      this,
      (value: EtherScanReturn) => {},
      (value: string) => {}
    )
    return result
  }

  async receiptStatus(receiptGuid: string, apiKey: string, isProxyContract: boolean) {
    try {
      const {network, networkId} = await getNetworkName(this)
      if (network === 'vm') {
        throw new Error('Cannot check the receipt status in the selected network')
      }
      const etherscanApi = getEtherScanApi(networkId)
      let receiptStatus

      if (isProxyContract) receiptStatus = await getProxyContractReceiptStatus(receiptGuid, apiKey, etherscanApi)
      else receiptStatus = await getReceiptStatus(receiptGuid, apiKey, etherscanApi)
      return {
        message: receiptStatus.result,
        succeed: receiptStatus.status === '0' ? false : true
      }
    } catch (e: any) {
      return {
        status: 'error',
        message: e.message,
        succeed: false
      }
    }
  }
}
