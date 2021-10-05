import { Bee } from '@ethersphere/bee-js'
// eslint-disable-next-line no-unused-vars
import type { UploadResult } from '@ethersphere/bee-js'

const beeNodes = [
  new Bee('http://localhost:1633/'),
  new Bee('https://bee-0.gateway.ethswarm.org/')
]

const postageBatchId = 'b75edc084f30f76368a6a1a596c39d3d913048d20b34d00a69ddd14cb15f507f'

export const publishToSwarm = async (contract, api) => {
  // gather list of files to publish
  const sources = []
  let metadata
  const item = { content: null, hash: null }
  const uploaded = []

  try {
    metadata = JSON.parse(contract.metadata)
  } catch (e) {
    throw new Error(e)
  }

  if (metadata === undefined) {
    throw new Error('No metadata')
  }

  await Promise.all(Object.keys(metadata.sources).map(fileName => {
    // find hash
    let hash = null
    try {
      // we try extract the hash defined in the metadata.json
      // in order to check if the hash that we get after publishing is the same as the one located in metadata.json
      // if it's not the same, we throw "hash mismatch between solidity bytecode and uploaded content"
      // if we don't find the hash in the metadata.json, the check is not done.
      //
      // TODO: refactor this with publishOnIpfs
      if (metadata.sources[fileName].urls) {
        metadata.sources[fileName].urls.forEach(url => {
          if (url.includes('bzz')) hash = url.match('bzz-raw://(.+)')[1]
        })
      }
    } catch (e) {
      throw new Error('Error while extracting the hash from metadata.json')
    }

    api.readFile(fileName).then((content) => {
      sources.push({
        content: content,
        hash: hash,
        filename: fileName
      })
    }).catch((error) => {
      console.log(error)
    })
  }))
  // publish the list of sources in order, fail if any failed

  await Promise.all(sources.map(async (item) => {
    try {
      const result = await swarmVerifiedPublish(item.content, item.hash)

      try {
        item.hash = result.url.match('bzz-raw://(.+)')[1]
      } catch (e) {
        item.hash = '<Metadata inconsistency> - ' + item.fileName
      }
      item.output = result
      uploaded.push(item)
      // TODO this is a fix cause Solidity metadata does not contain the right swarm hash (poc 0.3)
      metadata.sources[item.filename].urls[0] = result.url
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }))

  const metadataContent = JSON.stringify(metadata)
  try {
    const result = await swarmVerifiedPublish(metadataContent, '')

    try {
      contract.metadataHash = result.url.match('bzz-raw://(.+)')[1]
    } catch (e) {
      contract.metadataHash = '<Metadata inconsistency> - metadata.json'
    }
    item.content = metadataContent
    item.hash = contract.metadataHash
    uploaded.push({
      content: contract.metadata,
      hash: contract.metadataHash,
      filename: 'metadata.json',
      output: result
    })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }

  return { uploaded, item }
}

const swarmVerifiedPublish = async (content, expectedHash): Promise<Record<string, any>> => {
  try {
    const results = await uploadToBeeNodes(content)
    const hash = hashFromResults(results)

    if (expectedHash && hash !== expectedHash) {
      return { message: 'hash mismatch between solidity bytecode and uploaded content.', url: 'bzz-raw://' + hash, hash }
    } else {
      return { message: 'ok', url: 'bzz-raw://' + hash, hash }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const hashFromResults = (results: UploadResult[]) => {
  for (const result of results) {
    if (result != null) {
      return result.reference
    }
  }
  throw new Error('no result')
}

const uploadToBee = async (bee, content) => {
  try {
    return await bee.uploadData(postageBatchId, content)
  } catch {
    return null
  }
}

const uploadToBeeNodes = (content) => {
  return Promise.all(beeNodes.map((node) => uploadToBee(node, content)))
}
