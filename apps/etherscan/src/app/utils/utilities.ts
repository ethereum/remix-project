import { PluginClient } from "@remixproject/plugin"
import axios from 'axios'
import { scanAPIurls } from "./networks"
type RemixClient = PluginClient

/*
  status: 0=Error, 1=Pass 
  message: OK, NOTOK
  result: explanation
*/
export type receiptStatus = {
  result: string
  message: string
  status: string
}

export const getEtherScanApi = (network: string, networkId: any) => {
  let apiUrl

  if (network === "main") {
    apiUrl = "https://api.etherscan.io/api"
  } else if (network === "custom") {
    if (!(networkId in scanAPIurls)) {
      throw new Error("no known network to verify against")
    }
    apiUrl = (scanAPIurls as any)[networkId]
  } else {
    apiUrl = `https://api-${network}.etherscan.io/api`
  }

  return apiUrl
}

export const getNetworkName = async (client: RemixClient) => {
  const network = await client.call("network", "detectNetwork")
  if (!network) {
    throw new Error("no known network to verify against")
  } 
  return { network: network.name!.toLowerCase(), networkId: network.id }
}

export const getReceiptStatus = async (
  receiptGuid: string,
  apiKey: string,
  etherscanApi: string
): Promise<receiptStatus> => {
  const params = `guid=${receiptGuid}&module=contract&action=checkverifystatus&apiKey=${apiKey}`
  try {
    const response = await axios.get(`${etherscanApi}?${params}`)
    const { result, message, status } = response.data
    return {
      result,
      message,
      status,
    }
  } catch (error) {
    console.error(error)
  }
}
