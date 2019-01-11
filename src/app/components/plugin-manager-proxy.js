var registry = require('../../global/registry')

const CompilerAbstract = require('../compiler/compiler-abstract')

const EventManager = require('remix-lib').EventManager

class PluginManagerProxy {

  constructor () {
    this.event = new EventManager()
  }

  register (instance) {
    var event = this.event
    this._listener = (file, source, languageVersion, data) => {
      registry.get('compilersartefacts').api['__last'] = new CompilerAbstract(languageVersion, data, source)
      event.trigger('sendCompilationResult', [file, source, languageVersion, data])
    }
    instance.event.on('compilationFinished', this._listener)
  }

  unregister (instance) {
    if (!this._listener) {
      instance.event.on('compilationFinished', this._listener)
    }
  }

}

module.exports = PluginManagerProxy
