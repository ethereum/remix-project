/* eslint dot-notation: "off" */

import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import { existsSync, readFileSync } from 'fs'
import { OutputStandard } from '../types' // eslint-disable-line
const { spawn, execSync } = require('child_process')

export class SlitherClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string

  constructor (private readOnly = false) {
    super()
    this.methods = ['analyse']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
  }

  transform (detectors: Record<string, any>[]): OutputStandard[] {
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

  analyse (filePath: string, compilerConfig: Record<string, any>) {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg: string = '[Slither Analysis]: Cannot analyse in read-only mode'
        return reject(new Error(errMsg))
      }
      const options = { cwd: this.currentSharedFolder, shell: true }
      const { currentVersion, optimize, evmVersion } = compilerConfig
      if (currentVersion) {
        const versionString: string = currentVersion.substring(0, currentVersion.indexOf('+commit') + 16)
        const solcOutput: Buffer = execSync('solc --version', options)
        if (!solcOutput.toString().includes(versionString)) {
          const version: string = versionString.substring(0, versionString.indexOf('+commit'))
          const solcSelectInstalledVersions: Buffer = execSync('solc-select versions', options)
          if (!solcSelectInstalledVersions.toString().includes(version)) {
            execSync(`solc-select install ${version}`, options)
          }
          execSync(`solc-select use ${version}`, options)
        }
      }
      const outputFile: string = 'remix-slitherReport_' + Date.now() + '.json'
      const optimizeOption: string = optimize ? '--optimize ' : ''
      const evmOption: string = evmVersion ? `--evm-version ${evmVersion}` : ''
      const solcArgs: string = optimizeOption || evmOption ? `--solc-args '${optimizeOption}${evmOption}'` : ''
      const cmd: string = `slither ${filePath} ${solcArgs} --json ${outputFile}`
      const child = spawn(cmd, options)
      const response = {}
      child.on('close', () => {
        const outputFileAbsPath: string = `${this.currentSharedFolder}/${outputFile}`
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
            console.log('[Slither Analysis]: Error in running Slither Analysis')
            console.log(report['error'])
            reject(new Error('Error in running Slither Analysis. See remixd console.'))
          }
        } else reject(new Error('Error in generating Slither Analysis Report. See remixd console.'))
      })
    })
  }
}
