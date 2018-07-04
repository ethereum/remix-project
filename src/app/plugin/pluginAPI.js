'use strict'
/*
  Defines available API. `key` / `type`
*/
module.exports = (registry) => {
  return {
    config: {
      setConfig: (mod, path, content, cb) => {
        registry.get('fileproviders/config').api.set(mod + '/' + path, content)
        cb()
      },
      getConfig: (mod, path, cb) => {
        cb(null, registry.get('fileproviders/config').get(mod + '/' + path))
      },
      removeConfig: (mod, path, cb) => {
        cb(null, registry.get('fileproviders/config').api.remove(mod + '/' + path))
        if (cb) cb()
      }
    },
    compiler: {
      getCompilationResult: () => {
        return registry.get('compiler').api.lastCompilationResult
      }
    }
  }
}
