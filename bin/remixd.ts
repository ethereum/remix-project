#!/usr/bin/env node
import WebSocket from '../src/websocket'
import * as servicesList from '../src/serviceList'

const program = require('commander')

program
.usage('-s <shared folder>')
.description('Provide a two-way connection between the local computer and Remix IDE')
.option('--remix-ide  <url>', 'URL of remix instance allowed to connect to this web sockect connection')
.option('-s, --shared-folder <path>', 'Folder to share with Remix IDE')
.option('--read-only', 'Treat shared folder as read-only (experimental)')
.on('--help', function(){
  console.log('\nExample:\n\n    remixd -s ./ --remix-ide http://localhost:8080')
}).parse(process.argv)

const killCallBack: Array<Function> = []

if (!program.remixIde) {
  console.log('\x1b[31m%s\x1b[0m', '[ERR] URL Remix IDE instance has to be provided.')
}
console.log('\x1b[33m%s\x1b[0m', '[WARN] You may now only use IDE at ' + program.remixIde + ' to connect to that instance')

if (program.sharedFolder) {
  console.log('\x1b[33m%s\x1b[0m', '[WARN] Any application that runs on your computer can potentially read from and write to all files in the directory.')
  console.log('\x1b[33m%s\x1b[0m', '[WARN] Symbolic links are not forwarded to Remix IDE\n')
  try {
    const websocketHandler = new WebSocket(65520, { remixIdeUrl: program.remixIde }, servicesList['sharedfolder'])

    websocketHandler.start(() => {
      const remixdClient = new servicesList['sharedfolder']()

      remixdClient.setWebSocket(websocketHandler)
      remixdClient.sharedFolder(program.sharedFolder, program.readOnly || false)
    })
    killCallBack.push(websocketHandler.close.bind(websocketHandler))
  } catch(error) {
    throw new Error(error)
  }
}

// kill
function kill () {
  for (var k in killCallBack) {
    try {
      killCallBack[k]()
    } catch (e) {
      console.log(e)
    }
  }
}
process.on('SIGINT', kill) // catch ctrl-c
process.on('SIGTERM', kill) // catch kill
process.on('exit', kill)
