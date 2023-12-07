import { ElectronPlugin } from '@remixproject/engine-electron';
import { Plugin } from '@remixproject/engine';

const profile = {
  displayName: 'compilerLoader',
  name: 'compilerloader',
  description: 'Loads the compiler for offline use',
}

const methods = ['getBaseUrls']

export class compilerLoaderPlugin extends Plugin {
  constructor() {
    super(profile)
    this.methods = methods
  }

  async getBaseUrls() {
   
  }
}

export class compilerLoaderPluginDesktop extends ElectronPlugin {
  constructor() {
    super(profile)
    this.methods = []
  }

  onActivation(): void {
    this.on('compilerloader', 'downloadFinished', (path, url) => {
      console.log('downloadFinished', path, url)
      this.call('terminal', 'logHtml', 'Compiler downloaded from ' + url + ' to ' + path)
    })

    this.on('solidity', 'loadingCompiler', async (url) => {
      console.log('loadingCompiler in compilerloader', url, this)
      await this.call('compilerloader', 'downloadCompiler', url)
      const compilerList = await this.call('compilerloader', 'listCompilers')
      console.log('compilerList', compilerList)
      this.emit('compilersDownloaded', compilerList)
    })

    this.on('compilerloader', 'setSolJsonBinData', (url) => {
      console.log('setSolJsonBinData', url)
    })
  }


}