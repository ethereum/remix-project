import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { circomCli } from "../tools/circom"
import path from "path"

const profile: Profile = {
  displayName: 'circom',
  name: 'circom',
  description: 'Circom language compiler'
}

export class CircomElectronPlugin extends ElectronBasePlugin {
  clients: CircomElectronPluginClient[] = []

  constructor() {
    super(profile, clientProfile, CircomElectronPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'circom',
  displayName: 'circom',
  description: 'Circom Language Compiler',
  methods: ['parse', 'compile', 'generateR1cs']
}

class CircomElectronPluginClient extends ElectronBasePluginClient {
  isCircomInstalled: boolean = false

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload()
  }

  async install() {
    this.isCircomInstalled = await circomCli.isCircomInstalled()
    if (!this.isCircomInstalled) {
      await circomCli.installCircom()
      this.isCircomInstalled = true
    }
  }

  async compile(filePath: string) {
    if (!this.isCircomInstalled) await this.install()
    // @ts-ignore
    const wd = await this.call('fs', 'getWorkingDir')
    const depPath = path.join(wd, '.deps/https/raw.githubusercontent.com/iden3/')

    filePath = path.join(wd, filePath)
    await circomCli.run(`${filePath} -l ${depPath}`)
  }
}