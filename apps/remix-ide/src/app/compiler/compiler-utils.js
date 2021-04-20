const semver = require('semver')
const minixhr = require('minixhr')
/* global Worker */

export const baseURLBin = 'https://binaries.soliditylang.org/bin'
export const baseURLWasm = 'https://binaries.soliditylang.org/wasm'

export const pathToURL = {}

/**
 * Retrieves the URL of the given compiler version
 * @param version is the version of compiler with or without 'soljson-v' prefix and .js postfix
 */
export function urlFromVersion (version) {
  if (!version.startsWith('soljson-v')) version = 'soljson-v' + version
  if (!version.endsWith('.js')) version = version + '.js'
  return `${pathToURL[version]}/${version}`
}

/**
 * Checks if the worker can be used to load a compiler.
 * checks a compiler whitelist, browser support and OS.
 */
export function canUseWorker (selectedVersion) {
  const version = semver.coerce(selectedVersion)
  const isNightly = selectedVersion.includes('nightly')
  return browserSupportWorker() && (
    semver.gt(version, '0.6.3') ||
    (semver.gt(version, '0.3.6') && !isNightly)
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
