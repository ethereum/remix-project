const semver = require('semver')
/* global Worker */

export const baseUrl = 'https://solc-bin.ethereum.org/bin'

export function urlFromVersion (version) {
  return `${baseUrl}/soljson-v${version}.js`
}
/**
 * Checks if the worker can be used to load a compiler.
 * checks a compiler whitelist, browser support and OS.
 */
export function canUseWorker (selectedVersion) {
  // Following restrictions should be deleted when Solidity will release fixed versions of compilers.
  // See https://github.com/ethereum/remix-ide/issues/2461
  const isChrome = !!window.chrome
  const os = retrieveOS()
  // define a whitelist for Linux
  const linuxWL = ['0.4.26', '0.5.3', '0.5.4', '0.5.5']
  const version = semver.coerce(selectedVersion)
  // defining whitelist for chrome
  let isFromWhiteList = false
  switch (os) {
    case 'Windows':
      isFromWhiteList = semver.gt(version, '0.5.2') || version === '0.4.26'
      break
    case 'Linux':
      isFromWhiteList = semver.gt(version, '0.5.13') || linuxWL.includes(version)
      break
    default :
      isFromWhiteList = true
  }
  return browserSupportWorker() && (!isChrome || (isChrome && isFromWhiteList))
}

function browserSupportWorker () {
  return document.location.protocol !== 'file:' && Worker !== undefined
}

function retrieveOS () {
  let osName = 'Unknown OS'
  if (navigator.platform.indexOf('Win') !== -1) {
    osName = 'Windows'
  } else if (navigator.platform.indexOf('Linux') !== -1) {
    osName = 'Linux'
  }
  return osName
}
