'use strict'
var yo = require('yo-yo')
var async = require('async')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var executionContext = require('../execution-context')
var toolTip = require('../app/ui/tooltip')
var globalRegistry = require('../global/registry')

class CmdInterpreterAPI {
  constructor (terminal, localRegistry) {
    const self = this
    self.event = new EventManager()
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._components.terminal = terminal
    self._deps = {
      app: self._components.registry.get('app').api,
      editor: self._components.registry.get('editor').api
    }
    self.commandHelp = {
      'remix.debug(hash)': 'Start debugging a transaction.',
      'remix.loadgist(id)': 'Load a gist in the file explorer.',
      'remix.loadurl(url)': 'Load the given url in the file explorer. The url can be of type github, swarm or ipfs.',
      'remix.setproviderurl(url)': 'Change the current provider to Web3 provider and set the url endpoint.',
      'remix.exeCurrent()': 'Run the script currently displayed in the editor',
      'remix.help()': 'Display this help message'
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
        toolTip(`Unable to load ${url}: ${err}`)
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
  exeCurrent (cb) {
    const self = this
    var content = self._deps.editor.currentContent()
    if (!content) {
      toolTip('no content to execute')
      if (cb) cb()
      return
    }
    self._components.terminal.commands.script(content)
  }
  help (cb) {
    const self = this
    var help = yo`<div></div>`
    for (var k in self.commandHelp) {
      help.appendChild(yo`<div>${k}: ${self.commandHelp[k]}</div>`)
      help.appendChild(yo`<br>`)
    }
    self._components.terminal.commands.html(help)
    if (cb) cb()
    return ''
  }
}

module.exports = CmdInterpreterAPI
