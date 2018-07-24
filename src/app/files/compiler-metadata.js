'use strict'

class CompilerMetadata {
  constructor (events, opts) {
    var self = this
    self._events = events
    self._opts = opts
  }

  syncContractMetadata () {
    var self = this
    self._events.compiler.register('compilationFinished', (success, data, source) => {
      if (success) {
        var provider = self._opts.fileManager.currentFileProvider()
        var path = self._opts.fileManager.currentPath()
        if (provider && path) {
          self._opts.compiler.visitContracts((contract) => {
            var fileName = path + '/' + contract.name + '.json'
            provider.get(fileName, (error, content) => {
              if (!error) {
                content = content || '{}'
                var metadata
                try {
                  metadata = JSON.parse(content)
                } catch (e) {
                  console.log(e)
                }
                var linkReferences = metadata['linkReferences']
                if (!linkReferences) linkReferences = {}
                for (var libFile in contract.object.evm.bytecode.linkReferences) {
                  if (!linkReferences[libFile]) linkReferences[libFile] = {}
                  for (var lib in contract.object.evm.bytecode.linkReferences[libFile]) {
                    if (!linkReferences[libFile][lib]) {
                      linkReferences[libFile][lib] = '<address>'
                    }
                  }
                }
                metadata['linkReferences'] = linkReferences
                provider.set(fileName, JSON.stringify(metadata, null, '\t'))
              }
            })
          })
        }
      }
    })
  }

  metadataOf (contractName, callback) {
    var self = this
    var provider = self._opts.fileManager.currentFileProvider()
    var path = self._opts.fileManager.currentPath()
    if (provider && path) {
      var fileName = path + '/' + contractName + '.json'
      provider.get(fileName, (error, content) => {
        if (error) return callback(error)
        try {
          callback(null, JSON.parse(content))
        } catch (e) {
          callback(e.message)
        }
      })
    }
  }
}

module.exports = CompilerMetadata
