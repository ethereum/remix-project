import {ElectronBasePlugin, ElectronBasePluginClient} from '@remixproject/plugin-electron'
import path from 'path'
import * as esbuild from 'esbuild'
import fs from 'fs/promises'
import os, {arch} from 'os'
import {exec} from 'child_process'
import {promisify} from 'util'
const execAsync = promisify(exec)

export const cacheDir = path.join(os.homedir(), '.cache_remix_ide')

const profile = {
  name: 'scriptRunner',
  displayName: 'Script Runner',
  description: 'Execute script and emit logs',
}

const convertPathToPosix = (pathName: string): string => {
  return pathName.split(path.sep).join(path.posix.sep)
}

export class ScriptRunnerPlugin extends ElectronBasePlugin {
  constructor() {
    super(profile, clientProfile, ScriptRunnerClient)
    this.methods = [...super.methods]
  }
}

const clientProfile = {
  name: 'scriptRunner',
  displayName: 'Script Runner',
  description: 'Execute script and emit logs',
  methods: ['execute', 'yarnAdd', 'yarnInit'],
}

class ScriptRunnerClient extends ElectronBasePluginClient {
  workingDir: string = ''
  nodeVersion: string = ''
  yarnVersion: string = ''
  constructor(webContentsId: number, profile: any) {
    super(webContentsId, profile)
    this.onload(async () => {
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
      })

      try {
        const result = await execAsync('node --version')
        this.nodeVersion = result.stdout
        this.call('terminal' as any, 'log', `Node version: ${this.nodeVersion}`)
        return result.stdout
      } catch (error) {
        this.call('terminal' as any, 'log', `Node not found`)
      }

      try {
        const result = await execAsync('yarn --version')
        console.log('result', result)
        this.yarnVersion = result.stdout
        this.call('terminal' as any, 'log', `Yarn version: ${this.yarnVersion}`)
        return result.stdout
      } catch (error) {
        this.call('terminal' as any, 'log', `Yarn not found`)
      }
    })
  }

  async yarnAdd(module: string, version: string = ''): Promise<void> {
    const child = utilityProcess
      .fork(path.join(__dirname, '/../tools/yarn/bin/', 'yarn.js'), [`--cwd=${this.workingDir}`, 'add', `${module}@${version}`], {
        stdio: 'pipe',
      })
      .addListener('exit', () => {
        console.log('exit')
      })
    child &&
      child.stdout &&
      child.stdout.on('data', (data) => {
        this.call('terminal' as any, 'log', data.toString())
      })
    child &&
      child.stdout &&
      child.stdout.on('close', (data) => {
        this.call('terminal' as any, 'log', 'close')
      })
    child &&
      child.on('spawn', () => {
        this.call('terminal' as any, 'log', 'yarn start')
      })
    child &&
      child.on('exit', (data) => {
        this.call('terminal' as any, 'log', 'yarn install done')
      })
  }

  async yarnInit(): Promise<void> {
    const child = utilityProcess
      .fork(path.join(__dirname, '/../tools/yarn/bin/', 'yarn.js'), [`--cwd=${this.workingDir}`], {
        stdio: 'pipe',
      })
      .addListener('exit', () => {
        console.log('exit')
      })
    child &&
      child.stdout &&
      child.stdout.on('data', (data) => {
        this.call('terminal' as any, 'log', data.toString())
      })
    child &&
      child.stdout &&
      child.stdout.on('close', (data) => {
        this.call('terminal' as any, 'log', 'close')
      })
    child &&
      child.on('spawn', () => {
        this.call('terminal' as any, 'log', 'yarn start')
      })
    child &&
      child.on('exit', (data) => {
        this.call('terminal' as any, 'log', 'yarn install done')
      })
  }

  async execute(content: string, dir: string): Promise<void> {
    this.call('terminal' as any, 'log', this.workingDir)
    dir = await convertPathToPosix(this.fixPath(dir))

    const out = convertPathToPosix(this.fixPath('dist'))
    try {
      const build = await esbuild.build({
        entryPoints: [dir],
        bundle: true,
        outdir: out,
        plugins: [],
        platform: 'node',
        inject: ['/Volumes/bunsen/code/basic6/remix.ts']
      })
      console.log('build', build)
      if (build.errors.length > 0) {
        console.log('ERRORS', build.errors)
        return
      }
      console.log(path.join(out, 'test.js'))
      const child2 = utilityProcess.fork(path.join(out, 'test.js'), [], {
        stdio: 'pipe',
      })
      child2 &&
        child2.stdout &&
        child2.stdout.on('data', (data) => {
          this.call('terminal' as any, 'log', data.toString())
        })
    } catch (e: any) {
      // find all errors in string with 'Could not resolve'
      const errors = e.toString().match(/Could not resolve "([^"]*)"/g)
      if (errors) {
        for (const error of errors) {
          const match = error.match(/Could not resolve "([^"]*)"/)
          if (match) {
            const module = match[1]
            const modulePath = path.join(this.workingDir, 'node_modules', module)
            try {
              await fs.stat(modulePath)
            } catch (e) {
              console.log('modulePath', modulePath)
              this.emit('missingModule', module)
              this.call('terminal' as any, 'log', {
                type: 'error',
                value: `Missing module ${module}`,
              })
            }
          }
        }
      }
      console.log('ERROR', e)
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

let onEndPlugin = {
  name: 'onEnd',
  setup(build: esbuild.PluginBuild) {
    build.onEnd((result) => {
      console.log(`build ended with ${result.errors.length} errors`)
    })
  },
}

const onResolvePlugin = {
  name: 'onResolve',
  setup(build: esbuild.PluginBuild) {
    build.onLoad(
      {
        filter: /.*/,
      },
      async (args) => {
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
      }
    )
  },
}

import {URL} from 'url'
import axios from 'axios'
import {app, utilityProcess} from 'electron'

let httpPlugin = {
  name: 'http',
  setup(build: esbuild.PluginBuild) {
    // Intercept import paths starting with "http:" and "https:" so
    // esbuild doesn't attempt to map them to a file system location.
    // Tag them with the "http-url" namespace to associate them with
    // this plugin.
    build.onResolve({filter: /^https?:\/\//}, (args) => ({
      path: args.path,
      namespace: 'http-url',
    }))

    // We also want to intercept all import paths inside downloaded
    // files and resolve them against the original URL. All of these
    // files will be in the "http-url" namespace. Make sure to keep
    // the newly resolved URL in the "http-url" namespace so imports
    // inside it will also be resolved as URLs recursively.
    build.onResolve({filter: /.*/, namespace: 'http-url'}, (args) => ({
      path: new URL(args.path, args.importer).toString(),
      namespace: 'http-url',
    }))

    // When a URL is loaded, we want to actually download the content
    // from the internet. This has just enough logic to be able to
    // handle the example import from unpkg.com but in reality this
    // would probably need to be more complex.
    build.onLoad({filter: /.*/, namespace: 'http-url'}, async (args) => {
      // Download the file
      const response = await axios.get(args.path, {responseType: 'arraybuffer'})
      //console.log('response', response.data.toString())
      return {contents: response.data.toString(), loader: 'js'}
    })
  },
}
