const commander = require('commander')
const Web3 = require('web3')
const RemixTests = require('./index.js')
const fs = require('fs')
const { Signale } = require('signale')
const Provider = require('remix-simulator').Provider
require('colors')

// signale configuration
const options = {
  types: {
    greet: {
      badge: '\n👁',
      label: '',
      color: 'yellow'
    }
  }
}
const signale = new Signale(options)

commander.action(function (filename) {
  signale.greet(('Running remix-tests: Unit testing for solidity.\n').yellow)
  let web3 = new Web3()
  // web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))
  web3.setProvider(new Provider())
  // web3.setProvider(new web3.providers.WebsocketProvider('ws://localhost:8546'))

  let isDirectory = fs.lstatSync(filename).isDirectory()
  RemixTests.runTestFiles(filename, isDirectory, web3)
})

if (!process.argv.slice(2).length) {
  signale.fatal('Please specify a filename')
  process.exit()
}

commander.parse(process.argv)
