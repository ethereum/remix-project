var registry = require('../../global/registry')

const CompilerAbstract = require('../compiler/compiler-abstract')

const EventManager = require('remix-lib').EventManager

class PluginManagerProxy {

  constructor () {
    this.event = new EventManager()
    this._listeners = {}
    this._listeners['vyper'] = (file, source, languageVersion, data) => {
      registry.get('compilersartefacts').api['__last'] = new CompilerAbstract(languageVersion, data, source)
      this.event.trigger('sendCompilationResult', [file, source, languageVersion, data])
    }
    this._listeners['solidity'] = (file, source, languageVersion, data) => {
      registry.get('compilersartefacts').api['__last'] = new CompilerAbstract(languageVersion, data, source)
      this.event.trigger('sendCompilationResult', [file, source, languageVersion, data])
    }
  }

  register (name, instance) {
    if (this._listeners[name]) {
      instance.events.on('compilationFinished', this._listeners[name])
    }
  }

  unregister (name, instance) {
    if (this._listeners[name]) {
      instance.events.removeListener('compilationFinished', this._listeners[name])
    }
  }

}

module.exports = PluginManagerProxy
