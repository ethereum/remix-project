import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'
import { processStr } from 'solhint'
import { applyExtends } from 'solhint/lib/config/config-file'
import { rules } from './recommended-rules'
import bestPractises from 'solhint/lib/rules/best-practises'
import naming from 'solhint/lib/rules/naming'
import order from 'solhint/lib/rules/order'
import security from 'solhint/lib/rules/security'
import deprecations from 'solhint/lib/rules/deprecations'
import miscellaneous from 'solhint/lib/rules/miscellaneous'
import { customAction } from '@remixproject/plugin-api'

type Report = { 
  line: number,
  column: number,
  severity: string,
  message: string,
  ruleId: string,
  fix: string
}

const Config = `{
  "extends": "solhint:recommended",
  "plugins": [],
  "rules": {
    "avoid-suicide": "error",
    "avoid-sha3": "warn"
  }
}`

export class SolhintPlugin extends PluginClient {
  mdFile: string
  eventEmitter: EventEmitter
  triggerLinter: boolean
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['lintWithoutCompilationCustomAction', 'lintOnCompilation']
    createClient(this)
    this.mdFile = ''
    this.onload().then(async () => {
      await this.lintOnCompilation()
    })
  }


severity = {
  2: 'error',
  3: 'warning'
}

rules = {
  'solhint:recommended': () => {
    const enabledRules = {}
    this.coreRules().forEach(rule => {
      if (!rule.meta.deprecated && rule.meta.recommended) {
        enabledRules[rule.ruleId] = rule.meta.defaultSetup
      }
    })
    return enabledRules
  },
  'solhint:all': () => {
    const enabledRules = {}
    this.coreRules().forEach(rule => {
      if (!rule.meta.deprecated) {
        enabledRules[rule.ruleId] = rule.meta.defaultSetup
      }
    })
    return enabledRules
  },
  'solhint:default': () => {
    const enabledRules = {}
    this.coreRules().forEach(rule => {
      if (!rule.meta.deprecated && rule.meta.isDefault) {
        enabledRules[rule.ruleId] = rule.meta.defaultSetup
      }
    })
    return enabledRules
  }
}

coreRules() {
  return [
    ...bestPractises(),
    ...deprecations(),
    ...miscellaneous(),
    ...naming(),
    ...order(),
    ...security()
  ]
}

  async createConfigFile () {
    await this.call('fileManager', 'writeFile', '.solhint.json', Config)
  }

  async lintOnCompilation() {
    // if(!this.triggerLinter) return
    this.on('solidity', 'compilationFinished', async (fileName, source, languageVersion, data) => {
      const content = await this.call('fileManager', 'readFile', fileName)
      let configContent = Config
      if (await this.call('fileManager' as any, 'exists', '.solhint.json')) {
        configContent = await this.call('fileManager', 'readFile', '.solhint.json')
      }
      const configContentObj = JSON.parse(configContent)
      // apply the extend property
      const rulesObj = applyExtends(configContentObj, (path) => this.rules[path]())
      // console.log({ rulesObj })
      configContentObj.rules = { ...rulesObj, ...configContentObj.rules }
      configContentObj.extends = []

      const reporters = processStr(content, configContentObj)

      const reports: Array<Report> = reporters.reports
      // console.log({ reports })
      
      const hints = reports.map((report: Report) => {
        return {
          formattedMessage: `${report.message}\n${report.fix ? report.fix : ''}`,
          type: this.severity[report.severity] || 'error',
          column: report.column,
          line: report.line - 1
        }
      })
      this.emit('solhint' as any, 'lintOnCompilationFinished', hints)
    })
  }

  async lintWithoutCompilationCustomAction(action: customAction) {
    this.triggerLinter = true
    const content = await this.call('fileManager', 'readFile', action.path[0])
    let configContent = Config
    if (await this.call('fileManager' as any, 'exists', '.solhint.json')) {
      configContent = await this.call('fileManager', 'readFile', '.solhint.json')
    }
    const configContentObj = JSON.parse(configContent)
    // apply the extend property
    const rulesObj = applyExtends(configContentObj, (path) => this.rules[path]())
    configContentObj.rules = { ...rulesObj, ...configContentObj.rules }
    configContentObj.extends = []

    const reporters = processStr(content, configContentObj)
    const reports: Array<Report> = reporters.reports
    // console.log({ reports })
    const hints = reports.map((report: Report) => {
      return {
        formattedMessage: `${report.message}\n${report.fix ? report.fix : ''}`,
        type: this.severity[report.severity] || 'error',
        column: report.column,
        line: report.line - 1
      }
    })
    this.emit('solhint' as any, 'lintingFinished', hints)
  }
}

