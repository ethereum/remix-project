const semver = require('semver')
const minixhr = require('minixhr')
/* global Worker */

export const baseURLBin = 'https://solc-bin.ethereum.org/bin'
export const baseURLWasm = 'https://solc-bin.ethereum.org/wasm'

export const pathToURL = {}

/**
 * Retrieves the URL of the given compiler version
 * @param version is the version of compiler with or without 'soljson-v' prefix and .js postfix
 */
export function urlFromVersion (version) { // 0x959371506b8f6223d71c709ac2eb2d0158104dca2d76ca949f1662712cf0e6db
  console.log("1. orig_________= " + version + " path =", pathToURL, " version =", version, " and url is = ", pathToURL[version])
  if (version.substr(0, 9) !== 'soljson-v') version = 'soljson-v' + version
  if (version.substr(version.length - 3, version.length) !== '.js') version = version + '.js;'
  console.log("2. orig_________= " + version + " path =", pathToURL, " version =", version, " and url is = ", pathToURL[version])
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
    semver.gt(version, '0.3.6') && !isNightly
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
