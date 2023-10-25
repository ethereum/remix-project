import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import path from "path";
import { rgPath } from "@vscode/ripgrep";
import byline from "byline";
import { spawn } from "child_process";

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
  methods: ['glob']
}

export class RipgrepPluginClient extends ElectronBasePluginClient {
  workingDir: string = ''
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    
    this.onload(() => {
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
      })
    })
    
  }

  async glob(path: string, pattern: string, options?: any) {
    path = convertPathToPosix(this.fixPath(path))
    console.log('path', path, this.workingDir)

    return new Promise((c, e) => {

      const rg = spawn(rgPath, ['.', '-l', path])

      const resultrg: any[] = []

      const stream = byline(rg.stdout.setEncoding('utf8'))
      stream.on('data', (rgresult: string) => {
        console.log('rgresult', rgresult) 
        let pathWithoutWorkingDir = rgresult.replace(convertPathToPosix(this.workingDir), '')
        if (pathWithoutWorkingDir.endsWith('/')) {
          pathWithoutWorkingDir = pathWithoutWorkingDir.slice(0, -1)
        }
        if (pathWithoutWorkingDir.startsWith('/')) {
          pathWithoutWorkingDir = pathWithoutWorkingDir.slice(1)
        }
        if (pathWithoutWorkingDir.startsWith('\\')) {
          pathWithoutWorkingDir = pathWithoutWorkingDir.slice(1)
        }
        resultrg.push({
          path:convertPathToPosix(pathWithoutWorkingDir),
          isDirectory: false,
        })
      })
      stream.on('end', () => {
        c(resultrg)
      })
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
