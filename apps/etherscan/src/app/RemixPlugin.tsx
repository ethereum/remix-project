import { PluginClient } from '@remixproject/plugin';
import { verify, EtherScanReturn } from './utils/verify';
import { getReceiptStatus, getEtherScanApi, getNetworkName } from './utils';

export class RemixClient extends PluginClient {

    loaded() {
        return this.onload()
    }
  
    async verify (apiKey: string, contractAddress: string, contractArguments: string, contractName: string, compilationResultParam: any) {
        const result = await verify(apiKey, contractAddress, contractArguments, contractName, compilationResultParam, this,
            (value: EtherScanReturn) => {}, (value: string) => {})    
        return result
    }

    async receiptStatus (receiptGuid: string, apiKey: string) {
      const network = await getNetworkName(this)
      if (network === "vm") {
        throw new Error("Cannot check the receip status in the selected network")
      }
      const etherscanApi = getEtherScanApi(network)
      return getReceiptStatus(receiptGuid, apiKey, etherscanApi)
    }
}
