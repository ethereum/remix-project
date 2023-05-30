/**
 * @param {string} apikey - etherscan api key.
 * @param {string} guid - receipt id.
 * @returns {{ status, message, succeed }} receiptStatus
 */
export const receiptStatus = async (apikey: string, guid: string) => {
    return await remix.call('etherscan' as any,  'receiptStatus', guid, apikey)
}