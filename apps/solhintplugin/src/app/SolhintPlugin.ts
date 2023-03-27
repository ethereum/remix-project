import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'
import { processStr } from 'solhint'
import { rules } from './recommended-rules'

export class SolhintPlugin extends PluginClient {
  mdFile: string
  eventEmitter: EventEmitter
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['solhint']
    createClient(this)
    this.mdFile = ''
    this.onload().then(async () => {
      await this.main()
    })
  }

  main = async () => {
    this.eventEmitter.emit('ready')
    const file = "contract Test { function test() public { uint a = 1; uint b = 2; uint c = a + b; } }"
    const reporter = processStr(file, {
      rules: {
        ...rules
      }
    })
    console.log(reporter)
    reporter.reports.forEach((report) => {
      console.log(report)
      this.eventEmitter.emit('report', report)
    })
  }





}