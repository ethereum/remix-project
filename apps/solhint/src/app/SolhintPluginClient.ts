import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'
import { processStr } from 'solhint'
import { applyExtends } from 'solhint/lib/config/config-file'
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

export class SolHint extends PluginClient {
  mdFile: string
  eventEmitter: EventEmitter
  triggerLinter: boolean
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['lintContract', 'lintOnCompilation', 'lintContractCustomAction']
    createClient(this)
    this.mdFile = ''
    this.onload().then(async () => {
      await this.lintOnCompilation()
    })
  }
  async createConfigFile () {
    await this.call('fileManager', 'writeFile', '.solhint.json', Config)
  }

  async lintOnCompilation() {
    if(!this.triggerLinter) return
    this.on('solidity', 'compilationFinished', async (fileName, source, languageVersion, data) => {
      const hints = await this.lint(fileName)
      console.log('after compile', { hints })
      this.eventEmitter.emit('lintOnCompilationFinished', hints)
    })
    this.triggerLinter = false
  }

  async lintContractCustomAction(action: customAction) {
    this.triggerLinter = true
    await this.call('solidity', 'compile', action.path[0])
    await this.lintContract(action.path[0])
  }

  async lintContract(file: string) {
    const hints = await this.lint(file)
    console.log({ hints })
    this.eventEmitter.emit('lintingFinished', hints)
  }

  private async lint(fileName: string) {
    const content = await this.call('fileManager', 'readFile', fileName)
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
    const hints = reports.map((report: Report) => {
      return {
        formattedMessage: `${report.message}\n${report.fix ? report.fix : ''}`,
        type: this.severity[report.severity] || 'error',
        column: report.column,
        line: report.line - 1
      }
    })
    return hints
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
  
}

