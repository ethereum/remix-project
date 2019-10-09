'use strict'

const async = require('async')
const IpfsClient = require('ipfs-mini')

const ipfsNodes = [
  new IpfsClient({ host: 'ipfs.komputing.org', port: 443, protocol: 'https' }),
  new IpfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }),
  new IpfsClient({ host: '127.0.0.1', port: 5001, protocol: 'http' })
]

module.exports = (contract, fileManager, cb, ipfsVerifiedPublishCallBack) => {
  // gather list of files to publish
  var sources = []

  var metadata

  try {
    metadata = JSON.parse(contract.metadata)
  } catch (e) {
    return cb(e)
  }

  if (metadata === undefined) {
    return cb('No metadata')
  }

  async.eachSeries(Object.keys(metadata.sources), function (fileName, cb) {
    // find hash
    var hash
    try {
      hash = metadata.sources[fileName].urls[1].match('dweb:/ipfs/(.+)')[1]
    } catch (e) {
      return cb('Metadata inconsistency')
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
      cb()
    })
  }, function (error) {
    if (error) {
      cb(error)
    } else {
      // publish the list of sources in order, fail if any failed
      var uploaded = []
      async.eachSeries(sources, function (item, cb) {
        ipfsVerifiedPublish(item.content, item.hash, (error, result) => {
          try {
            item.hash = result.url.match('dweb:/ipfs/(.+)')[1]
          } catch (e) {
            item.hash = '<Metadata inconsistency> - ' + item.fileName
          }
          if (!error && ipfsVerifiedPublishCallBack) ipfsVerifiedPublishCallBack(item)
          item.output = result
          uploaded.push(item)
          cb(error)
        })
      }, () => {
        const metadataContent = JSON.stringify(metadata)
        ipfsVerifiedPublish(metadataContent, '', (error, result) => {
          try {
            contract.metadataHash = result.url.match('dweb:/ipfs/(.+)')[1]
          } catch (e) {
            contract.metadataHash = '<Metadata inconsistency> - metadata.json'
          }
          if (!error && ipfsVerifiedPublishCallBack) {
            ipfsVerifiedPublishCallBack({
              content: metadataContent,
              hash: contract.metadataHash
            })
          }
          uploaded.push({
            content: contract.metadata,
            hash: contract.metadataHash,
            filename: 'metadata.json',
            output: result
          })
          cb(error, uploaded)
        })
      })
    }
  })
}

async function ipfsVerifiedPublish (content, expectedHash, cb) {
  try {
    const results = await severalGatewaysPush(content)
    if (results !== expectedHash) {
      cb(null, { message: 'hash mismatch between solidity bytecode and uploaded content.', url: 'dweb:/ipfs/' + results, hash: results })
    } else {
      cb(null, { message: 'ok', url: 'dweb:/ipfs/' + results, hash: results })
    }
  } catch (error) {
    cb(error)
  }
}

function severalGatewaysPush (content) {
  const invert = p => new Promise((resolve, reject) => p.then(reject).catch(resolve)) // Invert res and rej
  const promises = ipfsNodes.map((node) => invert(node.add(content)))
  return invert(Promise.all(promises))
}
