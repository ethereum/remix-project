#!/usr/bin/env node
import latestVersion from 'latest-version'
import * as semver from 'semver'
import WebSocket from '../websocket'
import * as servicesList from '../serviceList'
import * as WS from 'ws' // eslint-disable-line
import { getDomain } from '../utils'
import Axios from 'axios'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as program from 'commander'

async function warnLatestVersion () {
  const latest = await latestVersion('@remix-project/remixd')
  const pjson = require('../package.json')
  if (semver.eq(latest, pjson.version)) {
    console.log('\x1b[32m%s\x1b[0m', `[INFO] you are using the latest version ${latest}`)
  } else if (semver.gt(latest, pjson.version)) {
    console.log('\x1b[33m%s\x1b[0m', `[WARN] latest version of remixd is ${latest}, you are using ${pjson.version}`)
    console.log('\x1b[33m%s\x1b[0m', '[WARN] please update using the following command:')
    console.log('\x1b[33m%s\x1b[0m', '[WARN] npm install @remix-project/remixd -g')
  }
}

const services = {
  git: (readOnly: boolean) => new servicesList.GitClient(readOnly),
  folder: (readOnly: boolean) => new servicesList.Sharedfolder(readOnly)
}

const ports = {
  git: 65521,
  folder: 65520
}

const killCallBack: Array<Function> = []
function startService<S extends 'git' | 'folder'> (service: S, callback: (ws: WS, sharedFolderClient: servicesList.Sharedfolder) => void) {
  const socket = new WebSocket(ports[service], { remixIdeUrl: program.remixIde }, () => services[service](program.readOnly || false))
  socket.start(callback)
  killCallBack.push(socket.close.bind(socket))
}

(async () => {
  const { version } = require('../package.json')
  program.version(version, '-v, --version')

  program
    .usage('-s <shared folder>')
    .description('Provide a two-way connection between the local computer and Remix IDE')
    .option('--remix-ide  <url>', 'URL of remix instance allowed to connect to this web sockect connection')
    .option('-s, --shared-folder <path>', 'Folder to share with Remix IDE')
    .option('--read-only', 'Treat shared folder as read-only (experimental)')
    .on('--help', function () {
      console.log('\nExample:\n\n    remixd -s ./ --remix-ide http://localhost:8080')
    }).parse(process.argv)
  // eslint-disable-next-line

  await warnLatestVersion()

  if (!program.remixIde) {
    console.log('\x1b[33m%s\x1b[0m', '[WARN] You can only connect to remixd from one of the supported origins.')
  } else {
    const isValid = await isValidOrigin(program.remixIde)
    /* Allow unsupported origins and display warning. */
    if (!isValid) {
      console.log('\x1b[33m%s\x1b[0m', '[WARN] You are using IDE from an unsupported origin.')
      console.log('\x1b[33m%s\x1b[0m', 'Check https://gist.github.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173 for list of all supported origins.\n')
      // return
    }
    console.log('\x1b[33m%s\x1b[0m', '[WARN] You may now only use IDE at ' + program.remixIde + ' to connect to that instance')
  }

  if (program.sharedFolder) {
    console.log('\x1b[33m%s\x1b[0m', '[WARN] Any application that runs on your computer can potentially read from and write to all files in the directory.')
    console.log('\x1b[33m%s\x1b[0m', '[WARN] Symbolic links are not forwarded to Remix IDE\n')
    try {
      startService('folder', (ws: WS, sharedFolderClient: servicesList.Sharedfolder) => {
        sharedFolderClient.setWebSocket(ws)
        sharedFolderClient.setupNotifications(program.sharedFolder)
        sharedFolderClient.sharedFolder(program.sharedFolder)
      })
      /*
      startService('git', (ws: WS, sharedFolderClient: servicesList.Sharedfolder) => {
        sharedFolderClient.setWebSocket(ws)
        sharedFolderClient.sharedFolder(program.sharedFolder)
      })
      */
    } catch (error) {
      throw new Error(error)
    }
  } else {
    console.log('\x1b[31m%s\x1b[0m', '[ERR] No valid shared folder provided.')
  }

  // kill
  function kill () {
    for (const k in killCallBack) {
      try {
        killCallBack[k]()
      } catch (e) {
        console.log(e)
      }
    }
    process.exit(0)
  }

  process.on('SIGINT', kill) // catch ctrl-c
  process.on('SIGTERM', kill) // catch kill
  process.on('exit', kill)

  async function isValidOrigin (origin: string): Promise<any> {
    if (!origin) return false
    const domain = getDomain(origin)
    const gistUrl = 'https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json'

    try {
      const { data } = await Axios.get(gistUrl)

      try {
        await fs.writeJSON(path.resolve(path.join(__dirname, '..', 'origins.json')), { data })
      } catch (e) {
        console.error(e)
      }

      return data.includes(origin) ? data.includes(origin) : data.includes(domain)
    } catch (e) {
      try {
        // eslint-disable-next-line
        const origins = require('../origins.json')
        const { data } = origins

        return data.includes(origin) ? data.includes(origin) : data.includes(domain)
      } catch (e) {
        return false
      }
    }
  }
})()
