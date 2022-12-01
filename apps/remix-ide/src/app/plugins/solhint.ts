import { Plugin } from '@remixproject/engine';
import { processStr } from 'solhint'

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

export class Solhint extends Plugin {
  constructor() {
    super(profile);
  }

  async createConfigFile () {
    await this.call('fileManager', 'writeFile', '.solhint.json', config)
  }

  async lint(fileName: string) {
    const content = await this.call('fileManager', 'readFile', fileName)
    const reporters = processStr(content, {
      rules: {
        ...recommendedRules
      }
    })

    const reports: Array<Report> = reporters.reports

    return reports.map((report: Report) => {
      return {
        severity: severity[report.severity] || 'error',
        formattedMessage: `${report.message}\n${report.fix ? report.fix : ''}`,
        type: report.ruleId,
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

const recommendedRules = {
  "const-name-snakecase": "error",
  "use-forbidden-name": "error",
  "imports-on-top": "error",
  "contract-name-camelcase": "error",
  "func-name-mixedcase": "error",
  "event-name-camelcase": "error",
  "var-name-mixedcase": "error",
  "not-rely-on-time": "error",
  "quotes": "error",
  "func-visibility": "error",
  "avoid-suicide": "error",
  "reentrancy": "error",
  "no-inline-assembly": "error",
  "compiler-version": "error",
  "not-rely-on-block-hash": "error",
  "avoid-throw": "error",
  "avoid-sha3": "error",
  "multiple-sends": "error",
  "state-visibility": "error",
  "avoid-tx-origin": "error",
  "avoid-low-level-calls": "error",
  "check-send-result": "error",
  "avoid-call-value": "error",
  "max-states-count": "error",
  "mark-callable-contracts": "off",
  "no-empty-blocks": "error",
  "no-unused-vars": "error",
  "payable-fallback": "error",
  "no-complex-fallback": "error",
  "visibility-modifier-order": "error"
}