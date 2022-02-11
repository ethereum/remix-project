import * as semver from 'semver'
import * as minixhr from 'minixhr'
/* global Worker */

export const baseURLBin = 'https://binaries.soliditylang.org/bin'
export const baseURLWasm = 'https://binaries.soliditylang.org/wasm'

export const pathToURL = {}

/**
 * Retrieves the URL of the given compiler version
 * @param version is the version of compiler with or without 'soljson-v' prefix and .js postfix
 */
export function urlFromVersion (version) {
  let url
  if (version === 'builtin') {
    let location: string | Location = window.document.location
    let path = location.pathname
    if (!path.startsWith('/')) path = '/' + path
    location = `${location.protocol}//${location.host}${path}assets/js`
    if (location.endsWith('index.html')) location = location.substring(0, location.length - 10)
    if (!location.endsWith('/')) location += '/'
    url = `${location}soljson.js`
  } else {
    version = version.replace('.Emscripten.clang', '')
    if (!version.startsWith('soljson-v')) version = 'soljson-v' + version
    if (!version.endsWith('.js')) version = version + '.js'
    url = `${pathToURL[version]}/${version}`
  }
  return url
}

/**
 * Checks if the worker can be used to load a compiler.
 * checks a compiler whitelist, browser support and OS.
 */
export function canUseWorker (selectedVersion) {
  if (selectedVersion.startsWith('http')) {
    return browserSupportWorker()
  }
  const version = semver.coerce(selectedVersion)
  if (!version) {
    return browserSupportWorker()
  }
  const isNightly = selectedVersion.includes('nightly')
  return browserSupportWorker() && (
    // All compiler versions (including nightlies) after 0.6.3 are wasm compiled
    semver.gt(version, '0.6.3') ||
    // Only releases are wasm compiled starting with 0.3.6
    (semver.gte(version, '0.3.6') && !isNightly)
  )
}

function browserSupportWorker () {
  return document.location.protocol !== 'file:' && Worker !== undefined
}

// returns a promise for minixhr
export function promisedMiniXhr (url) {
  return new Promise((resolve, reject) => {
    minixhr(url, (json, event) => {
      resolve({ json, event })
    })
  })
}
