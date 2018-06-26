'use strict'
/*
  Defines available API. `key` / `type`
*/
module.exports = (registry) => {
  return {
    config: {
      setConfig: (mod, path, content, cb) => {
        registry.get('fileProviders/config').api.set(mod + '/' + path, content)
        cb()
      },
      getConfig: (mod, path, cb) => {
        cb(null, registry.get('fileProviders/config').get(mod + '/' + path))
      },
      removeConfig: (mod, path, cb) => {
        cb(null, registry.get('fileProviders/config').api.remove(mod + '/' + path))
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
