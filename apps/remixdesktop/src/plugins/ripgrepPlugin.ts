import { Profile } from '@remixproject/plugin-utils'
import { ElectronBasePlugin, ElectronBasePluginClient } from '@remixproject/plugin-electron'
import path from 'path'
import { rgPath } from '@vscode/ripgrep'
import byline from 'byline'
import { spawn } from 'child_process'
import { SearchInWorkspaceOptions } from '../lib'

const profile: Profile = {
  name: 'ripgrep',
  displayName: 'ripgrep',
  description: 'Ripgrep plugin',
}

const convertPathToPosix = (pathName: string): string => {
  return pathName.split(path.sep).join(path.posix.sep)
}

export class RipgrepPlugin extends ElectronBasePlugin {
  clients: RipgrepPluginClient[] = []
  constructor() {
    super(profile, clientProfile, RipgrepPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'ripgrep',
  displayName: 'ripgrep',
  description: 'ripgrep plugin',
  methods: ['glob'],
}

const getArgs = (options?: SearchInWorkspaceOptions) => {
  const args = ['-l']
  args.push(options && options.matchCase ? '--case-sensitive' : '--ignore-case')
  if (options && options.matchWholeWord) {
    args.push('--word-regexp')
  }
  if (options && options.includeIgnored) {
    args.push('-uu')
  }
  args.push(options && options.useRegExp ? '--regexp' : '--fixed-strings')
  return args
}

export class RipgrepPluginClient extends ElectronBasePluginClient {
  workingDir: string = ''
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)

    this.onload(async () => {
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
      })
      this.workingDir = await this.call('fs' as any, 'getWorkingDir')
    })
  }

  async glob(opts: SearchInWorkspaceOptions) {
    try {
      opts = JSON.parse(JSON.stringify(opts))
      const fixedPath = this.fixPath(opts.path)
      const path = convertPathToPosix(fixedPath)

      const args = getArgs(opts)
      const globs: string[] = []
      if (opts && opts.include) {
        for (const include of opts.include) {
          if (include !== '') {
            globs.push('--glob=' + include + '')
          }
        }
      }
      if (opts && opts.exclude) {
        for (const exclude of opts.exclude) {
          if (exclude !== '') {
            globs.push('--glob=!' + exclude + '')
          }
        }
      }

      return new Promise((c, e) => {
        // replace packed app path with unpacked app path for release on windows

        const customRgPath = rgPath.includes('app.asar.unpacked') ? rgPath : rgPath.replace('app.asar', 'app.asar.unpacked')
        console.log('customRgPath', [...globs, ...args, opts.pattern, '.'], path)
        const rg = spawn(customRgPath, [...globs, ...args, opts.pattern, '.'], {
          cwd: path
        });


        const resultrg: any[] = []

        const stream = byline(rg.stdout.setEncoding('utf8'))
        stream.on('data', (rgresult: string) => {
          console.log('rgresult', rgresult, convertPathToPosix(this.workingDir), convertPathToPosix(rgresult))
          let pathWithoutWorkingDir = convertPathToPosix(rgresult).replace(convertPathToPosix(this.workingDir), '')
          console.log(pathWithoutWorkingDir)
          if (pathWithoutWorkingDir.endsWith('/')) {
            pathWithoutWorkingDir = pathWithoutWorkingDir.slice(0, -1)
          }
          if (pathWithoutWorkingDir.startsWith('/')) {
            pathWithoutWorkingDir = pathWithoutWorkingDir.slice(1)
          }
          if (pathWithoutWorkingDir.startsWith('./')) {
            pathWithoutWorkingDir = pathWithoutWorkingDir.slice(2)
          }
          if (pathWithoutWorkingDir.startsWith('\\')) {
            pathWithoutWorkingDir = pathWithoutWorkingDir.slice(1)
          }
          resultrg.push({
            path: pathWithoutWorkingDir,
            isDirectory: false,
          })
        })
        stream.on('end', () => { 
          c(resultrg)
        })
      })
    } catch (e) {
      return []
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
