var registry = require('../../global/registry')

const CompilerAbstract = require('../compiler/compiler-abstract')

const EventManager = require('remix-lib').EventManager

class PluginManagerProxy {

  constructor () {
    this.event = new EventManager()
  }

  register (mod, instance) {
    instance.event.on('compilationFinished', (file, source, languageVersion, data) => {
      registry.get('compilersartefacts').api['__last'] = new CompilerAbstract(languageVersion, data, source)
      this.event.trigger('sendCompilationResult', [file, source, languageVersion, data])
    })
  }

}

module.exports = PluginManagerProxy
