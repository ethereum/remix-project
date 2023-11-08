import {Profile} from '@remixproject/plugin-utils'
import {
  ElectronBasePlugin,
  ElectronBasePluginClient,
} from '@remixproject/plugin-electron'
import fs from 'fs/promises'


import express from 'express';
import { cacheDir } from '../utils/config'

const appExpress = express()

console.log('cacheDir', cacheDir)
appExpress.use(express.static(cacheDir))
const server = appExpress.listen(0, () => {
  console.log('Listening on port:', (server.address() as any));
});

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
    this.emit('downloadStarted', url)
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const file = Buffer.from(buffer)
    const fileName = url.split('/').pop()
    if (fileName) {
      const filePath = cacheDir + '/compilers/' + fileName
      await fs.writeFile(filePath, file)
      console.log('downloaded', filePath)
      this.emit('downloadFinished', fileName, url)
    }
  }

  async listCompilers(): Promise<string[]> {
    const compilersDir = cacheDir + '/compilers/'
    const compilers = await fs.readdir(compilersDir)
    return compilers
  }
}