'use strict'
var executionContext = require('../../execution-context')
var SourceHighlighter = require('../editor/sourceHighlighter')
/*
  Defines available API. `key` / `type`
*/
module.exports = (pluginManager, fileProviders, fileManager, compiler, udapp) => {
  var highlighter = new SourceHighlighter()
  return {
    app: {
      getExecutionContextProvider: (mod, cb) => {
        cb(null, executionContext.getProvider())
      },
      getProviderEndpoint: (mod, cb) => {
        if (executionContext.getProvider() === 'web3') {
          cb(null, executionContext.web3().currentProvider.host)
        } else {
          cb('no endpoint: current provider is either injected or vm')
        }
      },
      updateTitle: (mod, title, cb) => {
        pluginManager.plugins[mod].modal.setTitle(title)
        if (cb) cb()
      },
      detectNetWork: (mod, cb) => {
        executionContext.detectNetwork((error, network) => {
          cb(error, network)
        })
      }
    },
    config: {
      setConfig: (mod, path, content, cb) => {
        fileProviders['config'].set(mod + '/' + path, content)
        cb()
      },
      getConfig: (mod, path, cb) => {
        cb(null, fileProviders['config'].get(mod + '/' + path))
      },
      removeConfig: (mod, path, cb) => {
        cb(null, fileProviders['config'].remove(mod + '/' + path))
        if (cb) cb()
      }
    },
    compiler: {
      getCompilationResult: (mod, cb) => {
        cb(null, compiler.lastCompilationResult)
      }
    },
    udapp: {
      runTx: (mod, tx, cb) => {
        executionContext.detectNetwork((error, network) => {
          if (error) return cb(error)
          if (network.name === 'Main' && network.id === '1') {
            return cb('It is not allowed to make this action against mainnet')
          }
          udapp.silentRunTx(tx, (error, result) => {
            if (error) return cb(error)
            cb(null, {
              transactionHash: result.transactionHash,
              status: result.result.status,
              gasUsed: '0x' + result.result.gasUsed.toString('hex'),
              error: result.result.vm.exceptionError,
              return: result.result.vm.return ? '0x' + result.result.vm.return.toString('hex') : '0x',
              createdAddress: result.result.createdAddress ? '0x' + result.result.createdAddress.toString('hex') : undefined
            })
          })
        })
      },
      getAccounts: (mod, cb) => {
        executionContext.detectNetwork((error, network) => {
          if (error) return cb(error)
          if (network.name === 'Main' && network.id === '1') {
            return cb('It is not allowed to make this action against mainnet')
          }
          udapp.getAccounts(cb)
        })
      },
      createVMAccount: (mod, privateKey, balance, cb) => {
        if (executionContext.getProvider() !== 'vm') return cb('plugin API does not allow creating a new account through web3 connection. Only vm mode is allowed')
        udapp.createVMAccount(privateKey, balance, (error, address) => {
          cb(error, address)
        })
      }
    },
    editor: {
      getFilesFromPath: (mod, path, cb) => {
        fileManager.filesFromPath(path, cb)
      },
      getCurrentFile: (mod, cb) => {
        var path = fileManager.currentFile()
        if (!path) {
          cb('no file selected')
        } else {
          cb(null, path)
        }
      },
      getFile: (mod, path, cb) => {
        var provider = fileManager.fileProviderOf(path)
        if (provider) {
          // TODO add approval to user for external plugin to get the content of the given `path`
          provider.get(path, (error, content) => {
            cb(error, content)
          })
        } else {
          cb(path + ' not available')
        }
      },
      setFile: (mod, path, content, cb) => {
        var provider = fileManager.fileProviderOf(path)
        if (provider) {
          // TODO add approval to user for external plugin to set the content of the given `path`
          provider.set(path, content, (error) => {
            if (error) return cb(error)
            fileManager.syncEditor(path)
          })
        } else {
          cb(path + ' not available')
        }
      },
      highlight: (mod, lineColumnPos, filePath, hexColor, cb) => {
        var position
        try {
          position = JSON.parse(lineColumnPos)
        } catch (e) {
          return cb(e.message)
        }
        highlighter.currentSourceLocation(null)
        highlighter.currentSourceLocationFromfileName(position, filePath, hexColor)
        cb()
      },
      discardHighlight: (mod, cb) => {
        highlighter.currentSourceLocation(null)
        cb()
      }
    }
  }
}
