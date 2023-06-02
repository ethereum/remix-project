import { Plugin } from '@remixproject/engine'
import { WebContainer } from '@webcontainer/api'
import * as ts from "typescript";
import Ansi from "./terminalCodesToHtml"
import { logBuilder } from "@remix-ui/helper"

const profile = {
  name: 'web-container-plugin',
  displayName: 'WebContainerPlugin',
  description: 'WebContainerPlugin',
  methods: ['execute'],
  events: []
}

export class WebContainerPlugin extends Plugin {
  webcontainerInstance: WebContainer
  constructor () {
    super(profile)
    WebContainer.boot().then((webcontainerInstance: WebContainer) => {
      this.webcontainerInstance = webcontainerInstance
    }).catch((error) => {
      console.error(error)
    })
  }

  async execute (script: string, filePath: string) {
    const fileProvider = await this.call('fileManager', 'currentFileProvider')
    if (!fileProvider.copyFolderToJson) throw new Error('provider does not support copyFolderToJson')
    const files = await fileProvider.copyFolderToJson('/', null, null, (type, content, item) => {
      if (type === 'folder') {
        return { directory: content }
      } else if (type === 'file') {        
        if (item.endsWith('.ts')) {
          const output: ts.TranspileOutput = ts.transpileModule(content, { 
            // moduleName: filePath,
            compilerOptions: {
              target: ts.ScriptTarget.ES2015,
              module: ts.ModuleKind.CommonJS,
              esModuleInterop: true,  
            }})
            content = output.outputText
        }
        return { file: { contents: content } }
      }
      return content
    }, (path) => {
      if (!path) return path
      path = path.split('/')
      return stripOutExtension(path[path.length - 1])
    })
    console.log(files)
    this.webcontainerInstance.mount(files)
    await this.installDependencies()
    const fileName = stripOutExtension(filePath)
    let contentToRun = await this.webcontainerInstance.fs.readFile(fileName, 'utf8')
    await this.webcontainerInstance.fs.writeFile(fileName, this.injectRemix(contentToRun), 'utf8')
    const run = await this.webcontainerInstance.spawn('node', [stripOutExtension(filePath)])
    const self = this
    run.output.pipeTo(new WritableStream({
      write(data) {
        self.call('terminal', 'logHtml', Ansi({children: data}))
      }
    }));
  }

  async installDependencies() {
    // Install dependencies
    const installProcess = await this.webcontainerInstance.spawn('npm', ['install']);
    const self = this
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        self.call('terminal', 'logHtml', Ansi({children: data}) )
      }
    }))
    // Wait for install command to exit
    return installProcess.exit;
  }

  injectRemix (contentToRun) {
    return `
      global.remix = {
        test: () => {
          console.log('iii')
        }
      };${contentToRun}`
  }
}

const stripOutExtension = (path) => {
  if (!path.endsWith('.js') && !path.endsWith('.ts')) return path
  if (!path) return path
  return path.replace('.js', '').replace('.ts', '')
}
