import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
declare global {
  interface Window {
    _paq: any
  }
}
const _paq = window._paq = window._paq || []

export const profile = {
  name: 'compileAndRun',
  displayName: 'Compile and Run',
  description: 'after each compilation, run the script defined in Natspec.',
  methods: ['runScriptAfterCompilation'],
  version: packageJson.version,
  kind: 'none'
}

type listener = (event: KeyboardEvent) => void

export class CompileAndRun extends Plugin {
  executionListener: listener
  targetFileName: string

  constructor () {
    super(profile)
    this.executionListener = async (e) => {
      // ctrl+e or command+e
      
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode === 83) {
        const file = await this.call('fileManager', 'file')
        if (file) {
          if (file.endsWith('.sol')) {
            e.preventDefault()
            this.targetFileName = file
            await this.call('solidity', 'compile', file)
            _paq.push(['trackEvent', 'ScriptExecutor', 'CompileAndRun', 'compile_solidity'])
          } else if (file.endsWith('.js') || file.endsWith('.ts')) {
            e.preventDefault()
            this.runScript(file, false)
            _paq.push(['trackEvent', 'ScriptExecutor', 'CompileAndRun', 'run_script'])
          }
        }
      }
    }
  }

  runScriptAfterCompilation (fileName: string) {
    this.targetFileName = fileName
    _paq.push(['trackEvent', 'ScriptExecutor', 'CompileAndRun', 'request_run_script'])
  }

  async runScript (fileName, clearAllInstances) {
    await this.call('terminal', 'log', `running ${fileName} ...`)
    try {
      const exists = await this.call('fileManager', 'exists', fileName)
      if (!exists) {
        await this.call('terminal', 'log', `${fileName} does not exist.`)
        return
      }
      const content = await this.call('fileManager', 'readFile', fileName)
      if (clearAllInstances) {
        await this.call('udapp', 'clearAllInstances')
      }
      await this.call('scriptRunner', 'execute', content)
    } catch (e) {
      this.call('notification', 'toast', e.message || e)
    }    
  }

  onActivation () {
    window.document.addEventListener('keydown', this.executionListener)

    this.on('compilerMetadata', 'artefactsUpdated', async (fileName, contract) => {
      if (this.targetFileName === contract.file) {
        if (contract.object && contract.object.devdoc['custom:dev-run-script']) {
          this.targetFileName = null
          const file = contract.object.devdoc['custom:dev-run-script']
          if (file) {
            this.runScript(file, true)
            _paq.push(['trackEvent', 'ScriptExecutor', 'CompileAndRun', 'run_script_after_compile'])
          } else {
            this.call('notification', 'toast', 'You have not set a script to run. Set it with @custom:dev-run-script NatSpec tag.')
          }
        } else {
          this.call('notification', 'toast', 'You have not set a script to run. Set it with @custom:dev-run-script NatSpec tag.')
        }
      }
    })
  }

  onDeactivation () {
    window.document.removeEventListener('keydown', this.executionListener)
    this.off('compilerMetadata', 'artefactsUpdated')
  }
}
