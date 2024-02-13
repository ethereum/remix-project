/**
 * @param {string} apikey - etherscan api key
 * @param {string} contractAddress - Address of the contract to verify
 * @param {string} contractArguments - Parameters used in the contract constructor during the initial deployment. It should be the hex encoded value
 * @param {string} contractName - Name of the contract
 * @param {string} contractFile - File where the contract is located
 * @param {number | string} chainRef - Network chain id or API URL (optional)
 * @param {boolean} isProxyContract - true, if contract is a proxy contract (optional)
 * @param {string} expectedImplAddress - Implementation contract address, in case of proxy contract verification (optional)
 * @returns {{ guid, status, message, succeed }} verification result
 */
export const verify = async (apikey: string, contractAddress: string, contractArguments: string, contractName: string, contractFile: string, chainRef?: number | string, isProxyContract?: boolean, expectedImplAddress?: string) => {
  const compilationResultParam = await remix.call('compilerArtefacts' as any, 'getCompilerAbstract', contractFile)
  console.log('verifying.. ' + contractName)
  // update apiKey and chainRef to verify contract on multiple networks
  return await remix.call('etherscan' as any,  'verify', apikey, contractAddress, contractArguments, contractName, compilationResultParam, chainRef, isProxyContract, expectedImplAddress)
}
