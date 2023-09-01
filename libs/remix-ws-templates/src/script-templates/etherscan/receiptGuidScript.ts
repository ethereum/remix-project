/**
 * @param {string} apikey - etherscan api key
 * @param {string} guid - receipt id
 * @param {boolean} isProxyContract - true, if contract is a proxy contract (optional)
 * @returns {{ status, message, succeed }} receiptStatus
 */
export const receiptStatus = async (apikey: string, guid: string, isProxyContract?: boolean) => {
  return await remix.call('etherscan' as any,  'receiptStatus', guid, apikey, isProxyContract)
}