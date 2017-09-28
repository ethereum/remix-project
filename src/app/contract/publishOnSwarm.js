'use strict'

var async = require('async')
var swarmgw = require('swarmgw')

module.exports = (contract, appAPI, cb) => {
  // gather list of files to publish
  var sources = []

  sources.push({
    content: contract.metadata,
    hash: contract.metadataHash
  })

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

    appAPI.fileProviderOf(fileName).get(fileName, (error, content) => {
      if (error) {
        console.log(error)
      } else {
        sources.push({
          content: content,
          hash: hash
        })
      }
      cb()
    })
  }, function (error) {
    if (error) {
      cb(error)
    } else {
      // publish the list of sources in order, fail if any failed
      async.eachSeries(sources, function (item, cb) {
        swarmVerifiedPublish(item.content, item.hash, cb)
      }, cb)
    }
  })
}

function swarmVerifiedPublish (content, expectedHash, cb) {
  swarmgw.put(content, function (err, ret) {
    if (err) {
      cb(err)
    } else if (ret !== expectedHash) {
      cb('Hash mismatch')
    } else {
      cb()
    }
  })
}
