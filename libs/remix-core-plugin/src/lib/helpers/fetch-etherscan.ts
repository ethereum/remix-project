export const fetchContractFromEtherscan = async (plugin, network, contractAddress, targetPath) => {
  let data
  const compilationTargets = {}

  const etherscanKey = await plugin.call('config', 'getAppParameter', 'etherscan-access-token')
  if (etherscanKey) {
    const endpoint = network.id == 1 ? 'api.etherscan.io' : 'api-' + network.name + '.etherscan.io'
    data = await fetch('https://' + endpoint + '/api?module=contract&action=getsourcecode&address='  + contractAddress + '&apikey=' + etherscanKey)
    data = await data.json()
    // etherscan api doc https://docs.etherscan.io/api-endpoints/contracts
    if (data.message === 'OK' && data.status === "1") {
      if (data.result.length) {
        if (data.result[0].SourceCode === '') throw new Error('contract not verified in Etherscan')
        if (data.result[0].SourceCode.startsWith('{')) {
          data.result[0].SourceCode = JSON.parse(data.result[0].SourceCode.replace(/(?:\r\n|\r|\n)/g, '').replace(/^{{/,'{').replace(/}}$/,'}'))
        }
      } 
    } else throw new Error('unable to retrieve contract data ' + data.message)
  } else throw new Error('unable to try fetching the source code from etherscan: etherscan access token not found. please go to the Remix settings page and provide an access token.')

  if (!data || !data.result) {
    return null
  }

  if (typeof data.result[0].SourceCode === 'string') {
    const fileName = `${targetPath}/${data.result[0].ContractName}.sol`
    await plugin.call('fileManager', 'setFile', fileName , data.result[0].SourceCode)
    compilationTargets[fileName] = { content: data.result[0].SourceCode }
  } else if (data.result[0].SourceCode && typeof data.result[0].SourceCode == 'object') {
    const sources = data.result[0].SourceCode.sources
    for (let [file, source] of Object.entries(sources)) { // eslint-disable-line
      file = file.replace('browser/', '') // should be fixed in the remix IDE end.
      file = file.replace(/^\//g, '') // remove first slash.
      if (await plugin.call('contentImport', 'isExternalUrl', file)) {
        // nothing to do, the compiler callback will handle those
      } else {        
        const path = `${targetPath}/${file}`
        const content = (source as any).content
        await plugin.call('fileManager', 'setFile', path, content)
        compilationTargets[path] = { content }
      }
    }
  }
  let runs = 0
  try {
    runs = parseInt(data.result[0].Runs)
  } catch (e) {}
  const settings = {
    version: data.result[0].CompilerVersion.replace(/^v/, ''),
    language: 'Solidity',
    evmVersion: data.result[0].EVMVersion.toLowerCase(),
    optimize: data.result[0].OptimizationUsed === '1',
    runs
  }
  return {
    settings,
    compilationTargets
  }
}