import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { CIRCOM_INSTALLATION_PATH, circomCli, extractParentFromKey } from "../tools/circom"
import path from "path"
import { existsSync, readFileSync } from "fs"

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
  methods: ['install', 'run', 'getInputs']
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

  async run(filePath: string, options: Record<string, string>) {
    if (!this.isCircomInstalled) await this.install()
    // @ts-ignore
    const wd = await this.call('fs', 'getWorkingDir')
    // @ts-ignore
    const outputDirExists = await this.call('fs', 'exists', extractParentFromKey(filePath) + '/.bin')
    // @ts-ignore
    if (!outputDirExists) await this.call('fs', 'mkdir', extractParentFromKey(filePath) + '/.bin')
    filePath = path.join(wd, filePath)
    const depPath = path.join(wd, '.deps/https/raw.githubusercontent.com/iden3/')
    const outputDir = extractParentFromKey(filePath) + '/.bin'

    return await circomCli.run(`${filePath} -l ${depPath} -o ${outputDir}`, options)
  }

  getInputs() {
    const inputsFile = extractParentFromKey(CIRCOM_INSTALLATION_PATH) + '/log_input_signals.txt'
    const inputsFileExists = existsSync(inputsFile)
    const signals: string[] = []

    if (inputsFileExists) {
      const inputsContent = readFileSync(inputsFile, 'utf-8')
      const regexPattern = /main\.(\w+)/g

      let match
      while ((match = regexPattern.exec(inputsContent)) !== null) {
        signals.push(match[1])
      }
      return signals
    }
  }
}