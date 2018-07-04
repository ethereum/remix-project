'use strict'
var async = require('async')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var executionContext = require('../execution-context')
var toolTip = require('../app/ui/tooltip')
var globalRegistry = require('../global/registry')

class CmdInterpreterAPI {
  constructor (cmdInterpreter, localRegistry) {
    const self = this
    self.event = new EventManager()
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._components.cmdInterpreter = cmdInterpreter
    self._deps = {
      app: self._components.registry.get('app').api,
      editor: self._components.registry.get('editor').api
    }
  }
  debug (hash, cb) {
    const self = this
    self._deps.app.startdebugging(hash)
    if (cb) cb()
  }
  loadgist (id, cb) {
    const self = this
    self._deps.app.loadFromGist({gist: id})
    if (cb) cb()
  }
  loadurl (url, cb) {
    const self = this
    self._deps.app.importExternal(url, (err, content) => {
      if (err) {
        toolTip(`Unable to load ${url} from swarm: ${err}`)
        if (cb) cb(err)
      } else {
        try {
          content = JSON.parse(content)
          async.eachOfSeries(content.sources, (value, file, callbackSource) => {
            var url = value.urls[0] // @TODO retrieve all other contents ?
            self._deps.app.importExternal(url, (error, content) => {
              if (error) {
                toolTip(`Cannot retrieve the content of ${url}: ${error}`)
              }
              callbackSource()
            })
          }, (error) => {
            if (cb) cb(error)
          })
        } catch (e) {}
        if (cb) cb()
      }
    })
  }
  setproviderurl (url, cb) {
    executionContext.setProviderFromEndpoint(url, 'web3', (error) => {
      if (error) toolTip(error)
      if (cb) cb()
    })
  }
  batch (url, cb) {
    const self = this
    var content = self._deps.editor.currentContent()
    if (!content) {
      toolTip('no content to execute')
      if (cb) cb()
      return
    }
    var split = content.split('\n')
    async.eachSeries(split, (value, cb) => {
      if (!self._components.cmdInterpreter.interpret(value, (error) => {
        error ? cb(`Cannot run ${value}. stopping`) : cb()
      })) {
        cb(`Cannot interpret ${value}. stopping`)
      }
    }, (error) => {
      if (error) toolTip(error)
      if (cb) cb()
    })
  }
}

module.exports = CmdInterpreterAPI
