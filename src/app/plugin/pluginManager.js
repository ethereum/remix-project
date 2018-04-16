'use strict'
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
class PluginManager {
  constructor (api = {}, events = {}, opts = {}) {
    var self = this
    this.plugins = {}
    this.inFocus
    var allowedapi = {'setConfig': 1, 'getConfig': 1, 'removeConfig': 1}
    events.compiler.register('compilationFinished', (success, data, source) => {
      if (this.inFocus) {
        // trigger to the current focus
        this.post(this.inFocus, JSON.stringify({
          action: 'notification',
          key: 'compiler',
          type: 'compilationFinished',
          value: [
            success,
            data,
            source
          ]
        }))
      }
    })

    events.app.register('tabChanged', (tabName) => {
      if (this.inFocus && this.inFocus !== tabName) {
        // trigger unfocus
        this.post(this.inFocus, JSON.stringify({
          action: 'notification',
          key: 'app',
          type: 'unfocus',
          value: []
        }))
      }
      if (this.plugins[tabName]) {
        // trigger focus
        this.post(tabName, JSON.stringify({
          action: 'notification',
          key: 'app',
          type: 'focus',
          value: []
        }))
        this.inFocus = tabName
        this.post(tabName, JSON.stringify({
          action: 'notification',
          key: 'compiler',
          type: 'compilationData',
          value: [api.compiler.getCompilationResult()]
        }))
      }
    })

    window.addEventListener('message', (event) => {
      function response (key, type, callid, error, result) {
        self.post(self.inFocus, JSON.stringify({
          id: callid,
          action: 'response',
          key: key,
          type: type,
          error: error,
          value: [ result ]
        }))
      }
      if (event.type === 'message' && this.inFocus && this.plugins[this.inFocus] && this.plugins[this.inFocus].origin === event.origin) {
        var data = JSON.parse(event.data)
        data.value.unshift(this.inFocus)
        if (allowedapi[data.type]) {
          data.value.push((error, result) => {
            response(data.key, data.type, data.id, error, result)
          })
          api[data.key][data.type].apply({}, data.value)
        }
      }
    }, false)
  }
  register (desc, content) {
    this.plugins[desc.title] = {content, origin: desc.url}
  }
  post (name, value) {
    if (this.plugins[name]) {
      this.plugins[name].content.querySelector('iframe').contentWindow.postMessage(value, this.plugins[name].origin)
    }
  }
}

module.exports = PluginManager
