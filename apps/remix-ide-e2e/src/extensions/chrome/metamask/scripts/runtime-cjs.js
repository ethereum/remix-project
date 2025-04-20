// DO NOT EDIT! THIS FILE IS GENERATED FROM "runtime-cjs-template.js" BY RUNNING "builder-runtime.js"

// eslint-disable-next-line no-extra-semi
;(function() {
  function getGlobalRef () {
    if (typeof globalThis !== 'undefined') {
      return globalThis
    }
    const globalRef = typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : undefined)
    if (typeof globalRef !== 'undefined') {
      console.error('LavaMoat - Deprecation Warning: global reference is expected as `globalThis`')
    }
  }

  const globalRef = getGlobalRef()

  if (!globalRef) {
    throw new Error('Lavamoat - globalThis not defined')
  }

  // polyfill globalThis
  if (globalRef.globalThis !== globalRef) {
    globalRef.globalThis = globalRef
  }
  // polyfill node/browserify's globalRef
  if (globalRef.global !== globalRef) {
    globalRef.global = globalRef
  }

  const {strictScopeTerminator} = // define strict-scope-terminator
(function(){
  const global = globalRef
  const exports = {}
  const module = { exports }
  ;(function(){
// START of injected code from strict-scope-terminator
// import {
//   Proxy,
//   String,
//   TypeError,
//   ReferenceError,
//   create,
//   freeze,
//   getOwnPropertyDescriptors,
//   globalThis,
//   immutableObject,
// } from './commons.js';
const { freeze, create, getOwnPropertyDescriptors } = Object
const immutableObject = freeze(create(null))

// import { assert } from './error/assert.js';
const assert = {
  fail: (msg) => {
    throw new Error(msg)
  },
}

// const { details: d, quote: q } = assert;
const d = (strings, args) => strings.join() + args.join()
const q = (arg) => arg

/**
 * AlwaysThrowHandler This is an object that throws if any property is called.
 * It's used as a proxy handler which throws on any trap called. It's made from
 * a proxy with a get trap that throws. It's safe to create one and share it
 * between all Proxy handlers.
 */
const alwaysThrowHandler = new Proxy(
  immutableObject,
  freeze({
    get(_shadow, prop) {
      assert.fail(
        d`Please report unexpected scope handler trap: ${q(String(prop))}`
      )
    },
  })
)

/**
 * ScopeTerminatorHandler manages a strictScopeTerminator Proxy which serves as
 * the final scope boundary that will always return "undefined" in order to
 * prevent access to "start compartment globals".
 *
 * @type {ProxyHandler}
 */
const scopeProxyHandlerProperties = {
  // eslint-disable-next-line no-unused-vars
  get(_shadow, _prop) {
    return undefined
  },

  // eslint-disable-next-line no-unused-vars
  set(_shadow, prop, _value) {
    // We should only hit this if the has() hook returned true matches the v8
    // ReferenceError message "Uncaught ReferenceError: xyz is not defined"
    throw new ReferenceError(`${String(prop)} is not defined`)
  },

  has(_shadow, prop) {
    // we must at least return true for all properties on the realm globalThis
    return prop in globalThis
  },

  // note: this is likely a bug of safari
  // https://bugs.webkit.org/show_bug.cgi?id=195534
  getPrototypeOf() {
    return null
  },

  // Chip has seen this happen single stepping under the Chrome/v8 debugger.
  // TODO record how to reliably reproduce, and to test if this fix helps.
  // TODO report as bug to v8 or Chrome, and record issue link here.
  getOwnPropertyDescriptor(_target, prop) {
    // Coerce with `String` in case prop is a symbol.
    const quotedProp = q(String(prop))
    console.warn(
      `getOwnPropertyDescriptor trap on scopeTerminatorHandler for ${quotedProp}`,
      new TypeError().stack
    )
    return undefined
  },
}

// The scope handler's prototype is a proxy that throws if any trap other
// than get/set/has are run (like getOwnPropertyDescriptors, apply,
// getPrototypeOf).
const strictScopeTerminatorHandler = freeze(
  create(
    alwaysThrowHandler,
    getOwnPropertyDescriptors(scopeProxyHandlerProperties)
  )
)

const strictScopeTerminator = new Proxy(
  immutableObject,
  strictScopeTerminatorHandler
)

module.exports = {
  alwaysThrowHandler,
  strictScopeTerminatorHandler,
  strictScopeTerminator,
}

// END of injected code from strict-scope-terminator
  })()
  return module.exports
})()

  const moduleRegistry = new Map()
  const moduleCache = new Map()

  // create a lavamoat pulic API for loading modules over multiple files
  const LavaPack = Object.freeze({
    loadPolicy: Object.freeze(loadPolicy),
    loadBundle: Object.freeze(loadBundle),
    runModule: Object.freeze(runModule),
  })

  Object.defineProperty(globalRef, 'LavaPack', {value: LavaPack})

  function loadPolicy () {
    throw new Error('runtime-cjs: unable to enforce policy')
  }

  // it is called by the modules collection that will be appended to this file
  // eslint-disable-next-line no-unused-vars
  function loadBundle (newModules, entryPoints, bundlePolicy) {
    // ignore bundlePolicy as we wont be enforcing it
    // verify + load in each module
    for (const [moduleId, moduleDeps, initFn] of newModules) {
      // verify that module is new
      if (moduleRegistry.has(moduleId)) {
        throw new Error(`LavaMoat - loadBundle encountered redundant module definition for id "${moduleId}"`)
      }
      // add the module
      moduleRegistry.set(moduleId, { deps: moduleDeps, precompiledInitializer: initFn })
    }
    // run each of entryPoints
    const entryExports = Array.prototype.map.call(entryPoints, (entryId) => {
      return runModule(entryId)
    })
    // webpack compat: return the first module's exports
    return entryExports[0]
  }

  function runModule (moduleId) {
    if (!moduleRegistry.has(moduleId)) {
      throw new Error(`no module registered for "${moduleId}" (${typeof moduleId})`)
    }
    if (moduleCache.has(moduleId)) {
      const moduleObject = moduleCache.get(moduleId)
      return moduleObject.exports
    }
    const moduleObject = { exports: {} }
    const evalKit = {
      scopeTerminator: strictScopeTerminator,
      globalThis: globalRef,
    }
    moduleCache.set(moduleId, moduleObject)
    const moduleData = moduleRegistry.get(moduleId)
    const localRequire = requireRelative.bind(null, moduleId, moduleData)
    const { precompiledInitializer } = moduleData
    // this invokes the with-proxy wrapper (proxy replace by start compartment global)
    const moduleInitializerFactory = precompiledInitializer.call(evalKit)
    // this ensures strict mode
    const moduleInitializer = moduleInitializerFactory()
    moduleInitializer.call(moduleObject.exports, localRequire, moduleObject, moduleObject.exports)
    return moduleObject.exports
  }

  function requireRelative (parentId, parentData, requestedName) {
    const resolvedId = (parentData.deps || {})[requestedName] || requestedName
    return runModule(resolvedId)
  }

})()
