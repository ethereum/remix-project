'use strict'

var async = require('async')
var swarmgw = require('swarmgw')()

module.exports = (contract, fileManager, cb, swarmVerifiedPublishCallBack) => {
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
      hash = metadata.sources[fileName].urls[0].match('bzzr://(.+)')[1]
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
        swarmVerifiedPublish(item.content, item.hash, (error, result) => {
          if (!error && swarmVerifiedPublishCallBack) swarmVerifiedPublishCallBack(item)
          item.output = result
          uploaded.push(item)
          // TODO this is a fix cause Solidity metadata does not contain the right swarm hash (poc 0.3)
          metadata.sources[item.filename].urls[0] = result.url
          cb(error)
        })
      }, () => {
        swarmVerifiedPublish(JSON.stringify(metadata), '', (error, result) => {
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

function swarmVerifiedPublish (content, expectedHash, cb) {
  swarmgw.put(content, function (err, ret) {
    if (err) {
      cb(err)
    } else if (ret !== expectedHash) {
      cb(null, { message: 'hash mismatch between solidity bytecode and uploaded content.', url: 'bzz-raw://' + ret, hash: ret })
    } else {
      cb(null, { message: 'ok', url: 'bzz-raw://' + ret, hash: ret })
    }
  })
}
