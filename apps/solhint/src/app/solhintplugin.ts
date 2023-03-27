import { Plugin } from '@remixproject/engine';
import { processStr } from 'solhint'
import { applyExtends } from 'solhint/lib/config/config-file'
import bestPractises from 'solhint/lib/rules/best-practises'
import naming from 'solhint/lib/rules/naming'
import order from 'solhint/lib/rules/order'
import security from 'solhint/lib/rules/security'
import deprecations from 'solhint/lib/rules/deprecations'
import miscellaneous from 'solhint/lib/rules/miscellaneous'

const profile = {
  name: 'solhint',
  displayName: 'solhint',
  description: 'lint solidity files',
  methods: ['lint', 'createConfigFile']
};

type Report = { 
  line: number,
  column: number,
  severity: string,
  message: string,
  ruleId: string,
  fix: string
}

const config = `{
  "extends": "solhint:recommended",
  "plugins": [],
  "rules": {
    "avoid-suicide": "error",
    "avoid-sha3": "warn"
  }
}`

export class Solhint extends Plugin {
  constructor() {
    super(profile);
  }

  async createConfigFile () {
    await this.call('fileManager', 'writeFile', '.solhint.json', config)
  }

  async lint(fileName: string) {
    const content = await this.call('fileManager', 'readFile', fileName)
    let configContent = config
    if (await this.call('fileManager', 'exists', '.solhint.json')) {
      configContent = await this.call('fileManager', 'readFile', '.solhint.json')
    }
    const configContentObj = JSON.parse(configContent)
    // apply the extend property
    const rulesObj = applyExtends(configContentObj, (path) => rules[path]())
    configContentObj.rules = { ...rulesObj, ...configContentObj.rules }
    configContentObj.extends = []

    const reporters = processStr(content, configContentObj)

    const reports: Array<Report> = reporters.reports

    return reports.map((report: Report) => {
      return {
        formattedMessage: `${report.message}\n${report.fix ? report.fix : ''}`,
        type: severity[report.severity] || 'error',
        column: report.column,
        line: report.line - 1
      }
    })
  }
}

const severity = {
  2: 'error',
  3: 'warning'
}

const rules = {
  'solhint:recommended': () => {
    const enabledRules = {}
    coreRules().forEach(rule => {
      if (!rule.meta.deprecated && rule.meta.recommended) {
        enabledRules[rule.ruleId] = rule.meta.defaultSetup
      }
    })
    return enabledRules
  },
  'solhint:all': () => {
    const enabledRules = {}
    coreRules().forEach(rule => {
      if (!rule.meta.deprecated) {
        enabledRules[rule.ruleId] = rule.meta.defaultSetup
      }
    })
    return enabledRules
  },
  'solhint:default': () => {
    const enabledRules = {}
    coreRules().forEach(rule => {
      if (!rule.meta.deprecated && rule.meta.isDefault) {
        enabledRules[rule.ruleId] = rule.meta.defaultSetup
      }
    })
    return enabledRules
  }
}

function coreRules() {
  return [
    ...bestPractises(),
    ...deprecations(),
    ...miscellaneous(),
    ...naming(),
    ...order(),
    ...security()
  ]
}