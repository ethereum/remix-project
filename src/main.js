#!/usr/bin/env node
var Router = require('./router')
var program = require('commander')
program
.usage('-S <shared folder>')
.description('Provide a two ways connection between the local computer and Remix IDE')
.option('-S, --shared-folder <path>', 'Folder to share with Remix IDE')
.parse(process.argv)

if (!program.sharedFolder) {
  program.outputHelp()
  process.exit(1)
} else {
  console.log('\x1b[33m%s\x1b[0m', '[WARN] Any application that runs on your computer can potentially read from and write to all files in the directory.\n')
}

var router = new Router()
router.start(program.sharedFolder)
