import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import path from "path"
import * as esbuild from 'esbuild'
import { RemixURLResolver } from '@remix-project/remix-url-resolver'
import fs from 'fs/promises'
import os, { arch } from 'os'

const resolver = new RemixURLResolver()
export const cacheDir = path.join(os.homedir(), '.cache_remix_ide')

const profile = {
  "name": "scriptRunner",
  "displayName": "Script Runner",
  "description": "Execute script and emit logs",
}

const convertPathToPosix = (pathName: string): string => {
  return pathName.split(path.sep).join(path.posix.sep)
}

export class ScriptRunnerPlugin extends ElectronBasePlugin {
  constructor() {
    super(profile, clientProfile, ScriptRunnerClient)
    this.methods = [...super.methods, 'execute']
  }
}

const clientProfile = {
  "name": "scriptRunner",
  "displayName": "Script Runner",
  "description": "Execute script and emit logs",
  "methods": ["execute"]
}

class ScriptRunnerClient extends ElectronBasePluginClient {
  workingDir: string = ''
  constructor(webContentsId: number, profile: any) {
    super(webContentsId, profile)
    this.onload(() => {
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
      })
    })
  }
  
  async execute(content: string, dir: string): Promise<void> {

    this.call('terminal' as any, 'log', this.workingDir)
    const child = utilityProcess.fork(path.join(__dirname,'/../tools/yarn/bin/', 'yarn.js'), [`--cwd=${this.workingDir}`, 'init -y'], {
      stdio: 'pipe',
    })
    child && child.stdout && child.stdout.on('data', (data) => {
      this.call('terminal' as any, 'log', data.toString())
    })
    child && child.stdout && child.stdout.on('end', (data) => {
      this.call('terminal' as any, 'log', 'end')
    })
    
    dir = convertPathToPosix(this.fixPath(dir))
    console.log('execute', path)
    const out = convertPathToPosix(this.fixPath('dist'))
    const build = await esbuild.build({
      entryPoints: [dir],
      bundle: true,
      outdir: out,
      plugins: [],
    })
    if(build.errors.length > 0) {
      console.log('ERRORS', build.errors)
      return
    }
    console.log(path.join(out,'test.js'))
    const child2 = utilityProcess.fork(path.join(out,'test.js'), [], {
      stdio: 'pipe'
    })
    child2 && child2.stdout && child2.stdout.on('data', (data) => {
      this.call('terminal' as any, 'log', data.toString())
    })
    

  }

  fixPath(path: string): string {
    if (this.workingDir === '') throw new Error('workingDir is not set')
    if (path) {
      if (path.startsWith('/')) {
        path = path.slice(1)
      }
    }
    path = this.workingDir + (!this.workingDir.endsWith('/') ? '/' : '') + path
    return path
  }
}


const onResolvePlugin = {
  name: 'onResolve',
  setup(build: esbuild.PluginBuild) {

    build.onLoad({
      filter: /.*/,
    }, async args => {
      console.log('onLoad', args)
      /*if(args.namespace && args.namespace !== 'file'){
        const imported = await resolver.resolve(args.path)
        console.log('imported', imported)
        return {
          contents: imported.content,
          loader: 'js',
        }
      }*/
      return undefined

    })
  }
}


import { URL } from "url"
import axios from "axios"
import { app, utilityProcess } from "electron"

let httpPlugin = {
  name: 'http',
  setup(build: esbuild.PluginBuild) {
    // Intercept import paths starting with "http:" and "https:" so
    // esbuild doesn't attempt to map them to a file system location.
    // Tag them with the "http-url" namespace to associate them with
    // this plugin.
    build.onResolve({ filter: /^https?:\/\// }, args => ({
      path: args.path,
      namespace: 'http-url',
    }))

    // We also want to intercept all import paths inside downloaded
    // files and resolve them against the original URL. All of these
    // files will be in the "http-url" namespace. Make sure to keep
    // the newly resolved URL in the "http-url" namespace so imports
    // inside it will also be resolved as URLs recursively.
    build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
      path: new URL(args.path, args.importer).toString(),
      namespace: 'http-url',
    }))

    // When a URL is loaded, we want to actually download the content
    // from the internet. This has just enough logic to be able to
    // handle the example import from unpkg.com but in reality this
    // would probably need to be more complex.
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
      // Download the file
      const response = await axios.get(args.path, { responseType: 'arraybuffer' })
      //console.log('response', response.data.toString())
      return { contents: response.data.toString(), loader: 'js' }
    })
  },
}