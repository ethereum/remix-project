
export type Network = {
  id: number
  name: string
}

export const fetchContractFromEtherscan = async (plugin, endpoint: string | Network, contractAddress, targetPath, shouldSetFile = true, etherscanKey?) => {
  let data
  const compilationTargets = {}
  if (!etherscanKey) etherscanKey = await plugin.call('config', 'getAppParameter', 'etherscan-access-token')
  if (!etherscanKey) etherscanKey = '2HKUX5ZVASZIKWJM8MIQVCRUVZ6JAWT531'

  if (etherscanKey) {
    if (typeof endpoint === 'object' && endpoint !== null && 'id' in endpoint && 'name' in endpoint) {
      endpoint = endpoint.id == 1 ? 'api.etherscan.io' : 'api-' + endpoint.name + '.etherscan.io'
    }
    try {
      data = await fetch('https://' + endpoint + '/api?module=contract&action=getsourcecode&address=' + contractAddress + '&apikey=' + etherscanKey)
      data = await data.json()
      // etherscan api doc https://docs.etherscan.io/api-endpoints/contracts
      if (data.message === 'OK' && data.status === "1") {
        if (data.result.length) {
          if (data.result[0].SourceCode === '') throw new Error(`contract not verified on Etherscan ${endpoint}`)
          if (data.result[0].SourceCode.startsWith('{')) {
            data.result[0].SourceCode = JSON.parse(data.result[0].SourceCode.replace(/(?:\r\n|\r|\n)/g, '').replace(/^{{/, '{').replace(/}}$/, '}'))
          }
        }
      } else throw new Error('unable to retrieve contract data ' + data.message)
    } catch (e) {
      throw new Error('unable to retrieve contract data: ' + e.message)
    }
  } else throw new Error('unable to try fetching the source code from etherscan: etherscan access token not found. please go to the Remix settings page and provide an access token.')

  if (!data || !data.result) {
    return null
  }

  if (typeof data.result[0].SourceCode === 'string') {
    const fileName = `${targetPath}/${data.result[0].ContractName}.sol`
    if (shouldSetFile) await plugin.call('fileManager', 'setFile', fileName, data.result[0].SourceCode)
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
        if (shouldSetFile) await plugin.call('fileManager', 'setFile', path, content)
        compilationTargets[path] = { content }
      }
    }
  }
  let runs = 0
  try {
    runs = parseInt(data.result[0].Runs)
  } catch (e) { }
  const config = {
    language: 'Solidity',
    settings: data.result[0].SourceCode?.settings
  }
  return {
    config,
    compilationTargets,
    version: data.result[0].CompilerVersion.replace(/^v/, '')
  }
}
