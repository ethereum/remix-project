'use strict'
/**
 * Register and Manage plugin:
 * Plugin registration is done in the settings tab,
 * using the following format:
 * {
 *  "title": "<plugin name>",
 *  "url": "<plugin url>"
 * }
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
 *     type: 'getConfig',
 *     arguments: ['filename.ext'],
 *     id: <requestid>
 *    }
 *  the plugin will reveice a response like:
 *    {
 *      type: 'getConfig',
 *      id: <requestid>
 *      error,
 *      result
 *    }
 * same apply for the other call
 * - setConfig(filename, content)
 * - removeConfig
 *
 * See index.html and remix.js in test-browser folder for sample
 *
 */
module.exports = class PluginManager {
  constructor (api = {}, events = {}, opts = {}) {
    const self = this
    self._opts = opts
    self._api = api
    self._events = events
    self.plugins = {}
    self.inFocus
    self.allowedapi = {'setConfig': 1, 'getConfig': 1, 'removeConfig': 1}
    self._events.compiler.register('compilationFinished', (success, data, source) => {
      if (self.inFocus) {
        // trigger to the current focus
        self.post(self.inFocus, JSON.stringify({
          type: 'compilationFinished',
          value: { success, data, source }
        }))
      }
    })

    self._events.app.register('tabChanged', (tabName) => {
      if (self.inFocus && self.inFocus !== tabName) {
        // trigger unfocus
        self.post(self.inFocus, JSON.stringify({
          type: 'unfocus'
        }))
      }
      if (self.plugins[tabName]) {
        // trigger focus
        self.post(tabName, JSON.stringify({
          type: 'focus'
        }))
        self.inFocus = tabName
        self.post(tabName, JSON.stringify({
          type: 'compilationData',
          value: api.compiler.getCompilationResult()
        }))
      }
    })

    window.addEventListener('message', (event) => {
      function response (type, callid, error, result) {
        self.post(self.inFocus, JSON.stringify({
          id: callid,
          type: type,
          error: error,
          result: result
        }))
      }
      if (event.type === 'message' && self.inFocus && self.plugins[self.inFocus] && self.plugins[self.inFocus].origin === event.origin) {
        var data = JSON.parse(event.data)
        data.arguments.unshift(self.inFocus)
        if (self.allowedapi[data.type]) {
          data.arguments.push((error, result) => {
            response(data.type, data.id, error, result)
          })
          api[data.key][data.type].apply({}, data.arguments)
        }
      }
    }, false)
  }
  register (desc, content) {
    const self = this
    self.plugins[desc.title] = {content, origin: desc.url}
  }
  post (name, value) {
    const self = this
    if (self.plugins[name]) {
      self.plugins[name].content.querySelector('iframe').contentWindow.postMessage(value, self.plugins[name].origin)
    }
  }
}
