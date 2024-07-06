import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import { ElectronBasePluginRemixdClient } from "../lib/remixd"
import * as utils from '../lib/utils'
import { existsSync, readdirSync, readFileSync, unlinkSync } from "fs-extra";

export interface OutputStandard {
  description: string
  title: string
  confidence: string
  severity: string
  sourceMap: any
  category?: string
  reference?: string
  example?: any
  [key: string]: any
}

const { spawn, execSync } = require('child_process') // eslint-disable-line
const profile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
}

export class SlitherPlugin extends ElectronBasePlugin {
  clients: any[]
  constructor() {
    super(profile, clientProfile, SlitherPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'slither',
  displayName: 'electron slither',
  description: 'electron slither',
  methods: ['analyse']
}

class SlitherPluginClient extends ElectronBasePluginRemixdClient {

  mapNpmDepsDir(list) {
    const remixNpmDepsPath = utils.absolutePath('.deps/npm', this.currentSharedFolder)
    const localNpmDepsPath = utils.absolutePath('node_modules', this.currentSharedFolder)
    const npmDepsExists = existsSync(remixNpmDepsPath)
    const nodeModulesExists = existsSync(localNpmDepsPath)
    let isLocalDep = false
    let isRemixDep = false
    let allowPathString = ''
    let remapString = ''

    for (const e of list) {
      const importPath = e.replace(/import ['"]/g, '').trim()
      const packageName = importPath.split('/')[0]
      if (nodeModulesExists && readdirSync(localNpmDepsPath).includes(packageName)) {
        isLocalDep = true
        remapString += `${packageName}=./node_modules/${packageName} `
      } else if (npmDepsExists && readdirSync(remixNpmDepsPath).includes(packageName)) {
        isRemixDep = true
        remapString += `${packageName}=./.deps/npm/${packageName} `
      }
    }
    if (isLocalDep) allowPathString += './node_modules,'
    if (isRemixDep) allowPathString += './.deps/npm,'

    return { remapString, allowPathString }
  }

  transform(detectors: Record<string, any>[]): OutputStandard[] {
    const standardReport: OutputStandard[] = []
    for (const e of detectors) {
      const obj = {} as OutputStandard
      obj.description = e.description
      obj.title = e.check
      obj.confidence = e.confidence
      obj.severity = e.impact
      obj.sourceMap = e.elements.map((element) => {
        delete element.source_mapping.filename_used
        delete element.source_mapping.filename_absolute
        return element
      })
      standardReport.push(obj)
    }
    return standardReport
  }

  analyse(filePath: string, compilerConfig: Record<string, any>) {
    return new Promise((resolve, reject) => {
      const options = { cwd: this.currentSharedFolder, shell: true }

      const { currentVersion, optimize, evmVersion } = compilerConfig
      if (currentVersion && currentVersion.includes('+commit')) {
        // Get compiler version with commit id e.g: 0.8.2+commit.661d110
        const versionString: string = currentVersion.substring(0, currentVersion.indexOf('+commit') + 16)
        this.log(`[Slither Analysis]: Compiler version is ${versionString}`)
        let solcOutput: Buffer
        // Check solc current installed version
        try {
          solcOutput = execSync('solc --version', options)
        } catch (err) {
          this.error(err)
          reject(new Error('Error in running solc command'))
        }
        if (!solcOutput.toString().includes(versionString)) {
          this.log('[Slither Analysis]: Compiler version is different from installed solc version')
          // Get compiler version without commit id e.g: 0.8.2
          const version: string = versionString.substring(0, versionString.indexOf('+commit'))
          // List solc versions installed using solc-select
          try {
            const solcSelectInstalledVersions: Buffer = execSync('solc-select versions', options)
            // Check if required version is already installed
            if (!solcSelectInstalledVersions.toString().includes(version)) {
              this.log(`[Slither Analysis]: Installing ${version} using solc-select`)
              // Install required version
              execSync(`solc-select install ${version}`, options)
            }
            this.log(`[Slither Analysis]: Setting ${version} as current solc version using solc-select`)
            // Set solc current version as required version
            execSync(`solc-select use ${version}`, options)
          } catch (err) {
            this.error(err)
            reject(new Error('Error in running solc-select command'))
          }
        } else this.log('[Slither Analysis]: Compiler version is same as installed solc version')
      }
      // Allow paths and set solc remapping for import URLs
      const fileContent = readFileSync(utils.absolutePath(filePath, this.currentSharedFolder), 'utf8')
      const importsArr = fileContent.match(/import ['"][^.|..](.+?)['"];/g)
      let remaps = ''
      if (importsArr?.length) {
        const { remapString } = this.mapNpmDepsDir(importsArr)
        remaps = remapString.trim()
      }
      const optimizeOption: string = optimize ? '--optimize' : ''
      const evmOption: string = evmVersion ? `--evm-version ${evmVersion}` : ''
      let solcArgs = ''
      if (optimizeOption) {
        solcArgs += optimizeOption + ' '
      }
      if (evmOption) {
        if (!solcArgs.endsWith(' ')) solcArgs += ' '
        solcArgs += evmOption
      }
      if (solcArgs) {
        solcArgs = `--solc-args "${solcArgs.trimStart()}"`
      }
      const solcRemaps = remaps ? `--solc-remaps "${remaps}"` : ''

      const outputFile = 'remix-slither-report.json'
      try {
        // We don't keep the previous analysis
        const outputFilePath = utils.absolutePath(outputFile, this.currentSharedFolder)
        if (existsSync(outputFilePath)) unlinkSync(outputFilePath)
      } catch (e) {
        this.error('unable to remove the output file')
        this.error(e.message)
      }
      const cmd = `slither ${filePath} ${solcArgs} ${solcRemaps} --json ${outputFile}`
      this.log('[Slither Analysis]: Running Slither...')
      // Added `stdio: 'ignore'` as for contract with NPM imports analysis which is exported in 'stderr'
      // get too big and hangs the process. We process analysis from the report file only
      const child = spawn(cmd, { cwd: this.currentSharedFolder, shell: true, stdio: 'ignore' })

      const response = {}
      child.on('close', () => {
        const outputFileAbsPath: string = utils.absolutePath(outputFile, this.currentSharedFolder)
        // Check if slither report file exists
        if (existsSync(outputFileAbsPath)) {
          let report = readFileSync(outputFileAbsPath, 'utf8')
          report = JSON.parse(report)
          if (report['success']) {
            response['status'] = true
            if (!report['results'] || !report['results'].detectors || !report['results'].detectors.length) {
              response['count'] = 0
            } else {
              const { detectors } = report['results']
              response['count'] = detectors.length
              response['data'] = this.transform(detectors)
            }

            resolve(response)
          } else {
            this.log(report['error'])
            reject(new Error('Error in running Slither Analysis.'))
          }
        } else {
          this.error('Error in generating Slither Analysis Report. Make sure Slither is properly installed.')
          reject(new Error('Error in generating Slither Analysis Report. Make sure Slither is properly installed.'))
        }
      })
    })
  }
}


