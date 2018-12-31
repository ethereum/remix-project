'use strict'
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
const PluginAPI = require('./pluginAPI')
/**
 * Register and Manage plugin:
 *
 * Plugin registration is done in the settings tab,
 * using the following format:
 * {
 *  "title": "<plugin name>",
 *  "url": "<plugin url>"
 * }
 *
 * structure of messages:
 *
 * - Notification sent by Remix:
 *{
 *  action: 'notification',
 *  key: <string>,
 *  type: <string>,
 *  value: <array>
 *}
 *
 * - Request sent by the plugin:
 *{
 *  id: <number>,
 *  action: 'request',
 *  key: <string>,
 *  type: <string>,
 *  value: <array>
 *}
 *
 * - Response sent by Remix and receive by the plugin:
 *{
 *  id: <number>,
 *  action: 'response',
 *  key: <string>,
 *  type: <string>,
 *  value: <array>,
 *  error: (see below)
 *}
 * => The `error` property is `undefined` if no error happened.
 * => In case of error (due to permission, system error, API error, etc...):
 *            error: { code, msg (optional), data (optional), stack (optional)
 * => possible error code are still to be defined, but the generic one would be 500.
 *
 * Plugin receive 4 types of message:
 * - focus (when he get focus)
 * - unfocus (when he loose focus - is hidden)
 * - compilationData (that is triggered just after a focus - and send the current compilation data or null)
 * - compilationFinished (that is only sent to the plugin that has focus)
 *
 * Plugin can emit messages and receive response.
 *
 * CONFIG:
 * - getConfig(filename). The data to send should be formatted like:
 *    {
 *      id: <requestid>,
 *      action: 'request',
 *      key: 'config',
 *      type: 'getConfig',
 *      value: ['filename.ext']
 *    }
 *  the plugin will reveice a response like:
 *    {
 *      id: <requestid>,
 *      action: 'response',
 *      key: 'config',
 *      type: 'getConfig',
 *      error,
 *      value: ['content of filename.ext']
 *    }
 * same apply for the other call
 * - setConfig(filename, content)
 * - removeConfig
 *
 * See index.html and remix.js in test-browser folder for sample
 *
 */
module.exports = class PluginManager {
  constructor (app, compilersArtefacts, txlistener, fileProviders, fileManager, udapp) {
    const self = this
    self.event = new EventManager()
    var pluginAPI = new PluginAPI(
      this,
      fileProviders,
      fileManager,
      compilersArtefacts,
      udapp
    )
    self._components = { pluginAPI }
    self.plugins = {}
    self.origins = {}
    self.inFocus
    fileManager.event.register('currentFileChanged', (file, provider) => {
      self.broadcast(JSON.stringify({
        action: 'notification',
        key: 'editor',
        type: 'currentFileChanged',
        value: [ file ]
      }))
    })

    txlistener.event.register('newTransaction', (tx) => {
      self.broadcast(JSON.stringify({
        action: 'notification',
        key: 'txlistener',
        type: 'newTransaction',
        value: [tx]
      }))
    })

    window.addEventListener('message', (event) => {
      if (event.type !== 'message') return
      var extension = self.origins[event.origin]
      if (!extension) return

      function response (key, type, callid, error, result) {
        self.postToOrigin(event.origin, JSON.stringify({
          id: callid,
          action: 'response',
          key: key,
          type: type,
          error: error,
          value: [ result ]
        }))
      }
      var data = JSON.parse(event.data)
      data.value.unshift(extension)
      data.value.push((error, result) => {
        response(data.key, data.type, data.id, error, result)
      })
      if (pluginAPI[data.key] && pluginAPI[data.key][data.type]) {
        pluginAPI[data.key][data.type].apply({}, data.value)
      } else {
        response(data.key, data.type, data.id, `Endpoint ${data.key}/${data.type} not present`, null)
      }
    }, false)
  }
  unregister (desc) {
    const self = this
    self._components.pluginAPI.editor.discardHighlight(desc.title, () => {})
    delete self.plugins[desc.title]
    delete self.origins[desc.url]
  }
  register (desc, modal, content) {
    const self = this
    self.plugins[desc.title] = { content, modal, origin: desc.url }
    self.origins[desc.url] = desc.title
  }
  broadcast (value) {
    for (var plugin in this.plugins) {
      this.post(plugin, value)
    }
  }
  postToOrigin (origin, value) {
    if (this.origins[origin]) {
      this.post(this.origins[origin], value)
    }
  }
  receivedDataFrom (methodName, mod, argumentsArray) {
    // TODO check whether 'mod' as right to do that
    console.log(argumentsArray)
    this.event.trigger(methodName, argumentsArray) // forward to internal modules
    this.broadcast(JSON.stringify({ // forward to plugins
      action: 'notification',
      key: mod,
      type: methodName,
      value: argumentsArray
    }))
  }
  post (name, value) {
    const self = this
    if (self.plugins[name]) {
      self.plugins[name].content.querySelector('iframe').contentWindow.postMessage(value, self.plugins[name].origin)
    }
  }
}
