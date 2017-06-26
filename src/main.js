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
}

var router = new Router()
router.start(program.sharedFolder)
