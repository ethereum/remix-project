'use strict'
/**
 * Register and Manage plugin:
 * Plugin receive 4 types of message:
 * - focus (when he get focus)
 * - unfocus (when he loose focus - is hidden)
 * - compilationData (that is triggered just after a focus - and send the current compilation data or null)
 * - compilationFinished (that is only sent to the plugin that has focus)
 *
 * @param {String} txHash    - hash of the transaction
 */
class PluginManager {
  constructor (api, events) {
    this.plugins = {}
    this.inFocus
    events.compiler.register('compilationFinished', (success, data, source) => {
      if (this.inFocus) {
        // trigger to the current focus
        this.post(this.inFocus, JSON.stringify({
          type: 'compilationFinished',
          value: {
            success: success,
            data: data,
            source: source
          }
        }))
      }
    })

    events.app.register('tabChanged', (tabName) => {
      if (this.inFocus && this.inFocus !== tabName) {
        // trigger unfocus
        this.post(this.inFocus, JSON.stringify({
          type: 'unfocus'
        }))
      }
      if (this.plugins[tabName]) {
        // trigger focus
        this.post(tabName, JSON.stringify({
          type: 'focus'
        }))
        this.inFocus = tabName
        this.post(tabName, JSON.stringify({
          type: 'compilationData',
          value: api.getCompilationResult()
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
      if (event.type === 'message' && this.inFocus && this.plugins[this.inFocus] && this.plugins[this.inFocus].origin === event.origin) {
        var data = JSON.parse(event.data)
        data.arguments.unshift(this.inFocus)
        if (allowedapi[data.type]) {
          data.arguments.push((error, result) => {
            response(data.type, data.id, error, result)
          })
          api[data.type].apply({}, data.arguments)
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
