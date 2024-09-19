import { Profile } from '@remixproject/plugin-utils'
import { ElectronBasePlugin, ElectronBasePluginClient } from '@remixproject/plugin-electron'
import fs from 'fs/promises'
import axios from 'axios'

import express from 'express'
import { cacheDir } from '../utils/config'

export const baseURLBin = 'https://binaries.soliditylang.org/bin'
export const baseURLWasm = 'https://binaries.soliditylang.org/wasm'

const appExpress = express()

// used in e2e tests
const useOffline = process.argv.includes('--use-offline');

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
    this.methods = [...super.methods]
      ; (async () => {
        await getLists()
      })()
  }


}

const clientProfile: Profile = {
  name: 'compilerloader',
  displayName: 'compilerloader',
  description: 'Compiler Loader',
  methods: ['downloadCompiler', 'listCompilers', 'getBaseUrls', 'getJsonBinData'],
}

export interface iSolJsonBinDataBuild {
  path: string
  version: string
  build: string
  longVersion: string
  wasmURL: string
  binURL: string
  isDownloaded: boolean
}
export interface iSolJsonBinData {
  baseURLWasm: string
  baseURLBin: string
  wasmList: iSolJsonBinDataBuild[]
  binList: iSolJsonBinDataBuild[]
}

class CompilerLoaderPluginClient extends ElectronBasePluginClient {
  solJsonBinData: iSolJsonBinData
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
  }

  async onActivation(): Promise<void> {
    this.onload(() => {
      this.emit('loaded')
    })
  }

  async downloadCompiler(url: string): Promise<void> {
    console.log('downloadCompiler', url)
    if (url.includes('localhost')) return
    const plugin = this
    try {
      const fileName = url.split('/').pop()
      if (fileName) {
        const filePath = cacheDir + '/compilers/' + fileName
        try {
          if (await fs.stat(filePath)) {
            return
          }
        } catch (e) {
          // do nothing
        }
      }
      this.emit('downloadStarted', url)
      this.call('terminal' as any, 'logHtml', 'Downloading compiler from ' + url)
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
        plugin.call('terminal' as any, 'logHtml', 'Compiler downloaded from ' + url + ' to ' + fileName)
        await plugin.getJsonBinData()
        //this.emit('downloadFinished', fileName, url)
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

  async getJsonBinData() {
    const lists = await this.getLists()

    this.solJsonBinData = {
      baseURLWasm: 'http://localhost:' + (server.address() as any).port + '/compilers',
      baseURLBin: 'http://localhost:' + (server.address() as any).port + '/compilers',
      wasmList: lists.wasmData || [],
      binList: lists.binData || [],
    }

    const localCompilers = await this.listCompilers()
    this.solJsonBinData.wasmList && (this.solJsonBinData.wasmList = this.solJsonBinData.wasmList.map((item) => {
      localCompilers.includes(item.path) ? (item.wasmURL = 'http://localhost:' + (server.address() as any).port + '/compilers/') && (item.isDownloaded = true) : (item.wasmURL = baseURLWasm) && (item.isDownloaded = false)
      return item
    }))
    this.solJsonBinData.binList && (this.solJsonBinData.binList = this.solJsonBinData.binList.map((item) => {
      localCompilers.includes(item.path) ? (item.binURL = 'http://localhost:' + (server.address() as any).port + '/compilers/') && (item.isDownloaded = true) : (item.binURL = baseURLBin) && (item.isDownloaded = false)
      return item
    }))
    this.emit('jsonBinDataLoaded', this.solJsonBinData)
  }

  async getLists() {
    return await getLists()
  }
}

const getLists = async () => {
  let binData
  let wasmData

  if (!useOffline) {
    try {
      const binRes = await axios.get(baseURLBin + '/list.json')
      await fs.writeFile(cacheDir + '/binlist.json', JSON.stringify(binRes.data, null, 2))
      binData = binRes.data
    } catch (e) { }

    try {
      const wasmRes = await axios.get(baseURLWasm + '/list.json')
      await fs.writeFile(cacheDir + '/wasmlist.json', JSON.stringify(wasmRes.data, null, 2))
      wasmData = wasmRes.data
    } catch (e) { }
  }

  if (!wasmData) {
    try {
      wasmData = JSON.parse(await fs.readFile(cacheDir + '/wasmlist.json', 'utf8'))
    } catch (e) {
      wasmData = {}
    }
  }

  if (!binData) {
    try {
      binData = JSON.parse(await fs.readFile(cacheDir + '/binlist.json', 'utf8'))
    } catch (e) {
      binData = {}
    }
  }

  return {
    binData: binData.builds as any[],
    wasmData: wasmData.builds as any[],
  }
}
