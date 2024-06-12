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

export const getEtherScanApi = (networkId: any) => {
  if (!(networkId in scanAPIurls)) {
    throw new Error("no known network to verify against")
  }
  const apiUrl = (scanAPIurls as any)[networkId]
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

export const getProxyContractReceiptStatus = async (
  receiptGuid: string,
  apiKey: string,
  etherscanApi: string
): Promise<receiptStatus> => {
  const params = `guid=${receiptGuid}&module=contract&action=checkproxyverification&apiKey=${apiKey}`
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
