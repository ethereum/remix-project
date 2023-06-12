import { PluginClient } from '@remixproject/plugin';
import { verify, EtherScanReturn } from './utils/verify';
import { getReceiptStatus, getEtherScanApi, getNetworkName } from './utils';

export class RemixClient extends PluginClient {

    loaded() {
        return this.onload()
    }
  
    async verify (apiKey: string, contractAddress: string, contractArguments: string, contractName: string, compilationResultParam: any) {
        const result = await verify(apiKey, contractAddress, contractArguments, contractName, compilationResultParam, null, false, null, this,
            (value: EtherScanReturn) => {}, (value: string) => {})    
        return result
    }

    async receiptStatus (receiptGuid: string, apiKey: string) {
      try {
        const { network, networkId } = await getNetworkName(this)
        if (network === "vm") {
          throw new Error("Cannot check the receipt status in the selected network")
        }
        const etherscanApi = getEtherScanApi(networkId)
        const receiptStatus = await getReceiptStatus(receiptGuid, apiKey, etherscanApi)
        return {
          message: receiptStatus.result,
          succeed: receiptStatus.status === '0'  ? false : true
        }
      } catch (e: any){
        return {
          status: 'error',
          message: e.message,
          succeed: false
        }
      }      
    }
}
