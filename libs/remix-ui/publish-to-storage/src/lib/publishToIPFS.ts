import IpfsClient from 'ipfs-mini'

const ipfsNodes = [
  new IpfsClient({ host: 'ipfs.komputing.org', port: 443, protocol: 'https' }),
  new IpfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }),
  new IpfsClient({ host: '127.0.0.1', port: 5001, protocol: 'http' })
]

export const publishToIPFS = async (contract, fileManager) => {
  // gather list of files to publish
  const sources = []
  let metadata
  let item = null
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
      // TODO: refactor this with publishOnSwarm
      if (metadata.sources[fileName].urls) {
        metadata.sources[fileName].urls.forEach(url => {
          if (url.includes('ipfs')) hash = url.match('dweb:/ipfs/(.+)')[1]
        })
      }
    } catch (e) {
      throw new Error('Error while extracting the hash from metadata.json')
    }

    fileManager.fileProviderOf(fileName).get(fileName, (error, content) => {
      if (error) {
        console.log(error)
      } else {
        sources.push({
          content: content,
          hash: hash,
          filename: fileName
        })
      }
    })
  }))
  // publish the list of sources in order, fail if any failed
  await Promise.all(sources.map(item => {
    ipfsVerifiedPublish(item.content, item.hash, (error, result) => {
      try {
        item.hash = result.url.match('dweb:/ipfs/(.+)')[1]
      } catch (e) {
        item.hash = '<Metadata inconsistency> - ' + item.fileName
      }
      item.output = result
      uploaded.push(item)
    })
  }))
  const metadataContent = JSON.stringify(metadata)

  ipfsVerifiedPublish(metadataContent, '', (error, result) => {
    try {
      contract.metadataHash = result.url.match('dweb:/ipfs/(.+)')[1]
    } catch (e) {
      contract.metadataHash = '<Metadata inconsistency> - metadata.json'
    }
    if (!error) {
      item.content = metadataContent
      item.hash = contract.metadataHash
    }
    uploaded.push({
      content: contract.metadata,
      hash: contract.metadataHash,
      filename: 'metadata.json',
      output: result
    })
  })

  return { uploaded, item }
}

const ipfsVerifiedPublish = async (content, expectedHash, cb) => {
  try {
    const results = await severalGatewaysPush(content)
    if (expectedHash && results !== expectedHash) {
      cb(null, { message: 'hash mismatch between solidity bytecode and uploaded content.', url: 'dweb:/ipfs/' + results, hash: results })
    } else {
      cb(null, { message: 'ok', url: 'dweb:/ipfs/' + results, hash: results })
    }
  } catch (error) {
    cb(error)
  }
}

const severalGatewaysPush = (content) => {
  const invert = p => new Promise((resolve, reject) => p.then(reject).catch(resolve)) // Invert res and rej
  const promises = ipfsNodes.map((node) => invert(node.add(content)))

  return invert(Promise.all(promises))
}
