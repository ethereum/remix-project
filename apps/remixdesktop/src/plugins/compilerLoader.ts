import {Profile} from '@remixproject/plugin-utils'
import {ElectronBasePlugin, ElectronBasePluginClient} from '@remixproject/plugin-electron'
import fs from 'fs/promises'
import axios from 'axios'

import express from 'express'
import {cacheDir} from '../utils/config'

export const baseURLBin = 'https://binaries.soliditylang.org/bin'
export const baseURLWasm = 'https://binaries.soliditylang.org/wasm'

const appExpress = express()

console.log('cacheDir', cacheDir)
appExpress.use(express.static(cacheDir))
const server = appExpress.listen(0, () => {
  console.log('Listening on port:', server.address() as any)
})

const profile: Profile = {
  displayName: 'compilerLoader',
  name: 'compilerloader',
  description: 'Compiler Loader',
}

export class CompilerLoaderPlugin extends ElectronBasePlugin {
  clients: CompilerLoaderPluginClient[] = []
  constructor() {
    super(profile, clientProfile, CompilerLoaderPluginClient)
    this.methods = [...super.methods, 'getPort']
  }

  async getPort(): Promise<number> {
    return (server.address() as any).port
  }
}

const clientProfile: Profile = {
  name: 'compilerloader',
  displayName: 'compilerloader',
  description: 'Compiler Loader',
  methods: ['getPort', 'downloadCompiler', 'listCompilers'],
}

class CompilerLoaderPluginClient extends ElectronBasePluginClient {
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
  }

  async getPort(): Promise<number> {
    return (server.address() as any).port
  }

  async downloadCompiler(url: string): Promise<void> {
    console.log('downloadCompiler', url)

    const plugin = this
    try {
      const fileName = url.split('/').pop()
      if (fileName) {
        const filePath = cacheDir + '/compilers/' + fileName
        try{
        if (await fs.stat(filePath)) {
          return
        }}
        catch(e){
          // do nothing
        }
      }
      this.emit('downloadStarted', url)
      this.call('terminal' as any, 'logHtml', 'Downloading compiler from ' +  url)
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress(progressEvent) {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            plugin.call('terminal' as any, 'logHtml', 'percent loaded: ' + percentCompleted)
          } else {
            plugin.call('terminal' as any, 'logHtml', 'bytes loaded: ' + progressEvent.loaded)
          }
        },
      })
      const buffer = await res.data
      const file = Buffer.from(buffer)
      
      if (fileName) {
        const filePath = cacheDir + '/compilers/' + fileName
        await fs.writeFile(filePath, file)
        console.log('downloaded', filePath)
        this.emit('downloadFinished', fileName, url)
      }
    } catch (e: any) {
        plugin.call('terminal' as any, 'log', {
          type: 'error',
          value: `Failed to download ${url}: ${e.message}`,
        })
    }
  }

  async listCompilers(): Promise<string[]> {
    const compilersDir = cacheDir + '/compilers/'
    const compilers = await fs.readdir(compilersDir)
    return compilers
  }
}
