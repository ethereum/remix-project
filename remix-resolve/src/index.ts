/*
const rr = require('remix-resolve')
const fileContent = rr.resolve('https://github.com/ethereum/greeter.sol')
const input = rr.combineSource({ 'greeter.sol': content })
*/
export * from './resolve'
export * from './combineSource.js'
export * from './getFile'
