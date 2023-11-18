import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { utilityProcess } from "electron"
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
  
  async execute(content: string, path: string): Promise<void> {
    path = convertPathToPosix(this.fixPath(path))
    console.log('execute', path)
    const out = convertPathToPosix(this.fixPath('dist'))
    const build = await esbuild.build({
      entryPoints: [path],
      bundle: true,
      outdir: out,
      plugins: [onResolvePlugin],
    })
    console.log(build)
    if(build.errors.length > 0) {
      console.log('ERRORS', build.errors)
      return
    }

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