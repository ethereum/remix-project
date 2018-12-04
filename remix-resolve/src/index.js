/*
const rr = require('remix-resolve')
const fileContent = rr.resolve('https://github.com/ethereum/greeter.sol')
const input = rr.combineSource({ 'greeter.sol': content })
*/
const resolve = require('./resolve.js')
const combineSource = require('./combineSource.js')
const getFile = require('./getFile.js')

module.exports = {
  resolve: resolve,
  combineSource: combineSource,
  getFile: getFile
}
