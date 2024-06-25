'use strict'
import { Registry } from '@remix-project/remix-lib'
import { CodeParser } from "../code-parser";

export type CodeParserImportsData = {
    files?: string[],
    modules?: string[],
    packages?: string[],
    timestamp?: number
}

export default class CodeParserImports {
  plugin: CodeParser

  data: CodeParserImportsData = {}
  directoryUpdateCacheTimeStamp = 0
  constructor(plugin: CodeParser) {
    this.plugin = plugin
    this.init()
  }

  async getImports(){
    if (!this.data || !this.data.files || !this.data.timestamp || this.data.timestamp != this.directoryUpdateCacheTimeStamp){
      await this.setFileTree()
    }
    return this.data
  }

  async init() {
    // @ts-ignore
    const txt = await import('raw-loader!libs/remix-ui/editor/src/lib/providers/completion/contracts/contracts.txt')
    this.data.modules = txt.default.split('\n')
      .filter(x => x !== '')
      .map(x => x.replace('./node_modules/', ''))
      .filter(x => {
        if (x.includes('@openzeppelin')) {
          return !x.includes('mock')
        } else {
          return true
        }
      })

    // get unique first words of the values in the array
    this.data.packages = [...new Set(this.data.modules.map(x => x.split('/')[0]))]
  }

  updateDirectoryCacheTimeStamp = async () => {
    this.directoryUpdateCacheTimeStamp = Date.now()
  }

  setFileTree = async () => {
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      const search = {
        path: '/',
        include: ['**/*.sol', '**/*.vy', '**/*.py'],
        exclude: [],
        pattern: [],
        matchCase: false,
        useRegExp: false,
        matchWholeWord: false,
        maxResults: 10000
      }

      const files = await this.plugin.call('ripgrep', 'glob', search)
      // only get path property of files
      this.data.files = files.map((x) => x.path)
    } else {
      this.data.files = await this.getDirectory('/')
      this.data.files = this.data.files.filter((x) => x.endsWith('.sol') && !x.startsWith('.deps') && !x.startsWith('.git'))
    }
    this.data.timestamp = this.directoryUpdateCacheTimeStamp || Date.now()
  }

  getDirectory = async (dir: string) => {
    let result = []
    let files = {}
    try {
      if (await this.plugin.call('fileManager', 'exists', dir)) {
        files = await this.plugin.call('fileManager', 'readdir', dir)
      }
    } catch (e) {}

    const fileArray = this.normalize(files)
    for (const fi of fileArray) {
      if (fi) {
        const type = fi.data.isDirectory
        if (type === true) {
          result = [...result, ...(await this.getDirectory(`${fi.filename}`))]
        } else {
          result = [...result, fi.filename]
        }
      }
    }
    return result
  }

  normalize = filesList => {
    const folders = []
    const files = []
    Object.keys(filesList || {}).forEach(key => {
      if (filesList[key].isDirectory) {
        folders.push({
          filename: key,
          data: filesList[key]
        })
      } else {
        files.push({
          filename: key,
          data: filesList[key]
        })
      }
    })
    return [...folders, ...files]
  }

}