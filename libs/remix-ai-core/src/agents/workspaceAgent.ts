import { IContextType, SupportedFileExtensions } from "../types/types";

export class workspaceAgent {
  plugin: any
  currentWorkspace: string = ''
  static instance
  ctxFiles:any

  private constructor(props) {
    this.plugin = props;
  }

  public static getInstance(props) {
    if (workspaceAgent.instance) return workspaceAgent.instance
    workspaceAgent.instance = new workspaceAgent(props)
    return workspaceAgent.instance
  }

  async getCurrentWorkspaceFiles() {
    try {
      let files = '{\n'
      const jsonDirsContracts = await this.plugin.call('fileManager', 'copyFolderToJson', '/');
      for (const dirs in jsonDirsContracts) {
        if (dirs.startsWith('.') || dirs.startsWith('node_modules') || dirs.startsWith('/.')) continue;
        for (const file in jsonDirsContracts[dirs].children) {
          if (file.startsWith('.')) continue;
          if (!Object.values(SupportedFileExtensions).some(ext => file.endsWith(ext))) continue;

          files += `"${file}": ${JSON.stringify(jsonDirsContracts[dirs].children[file].content)}},`
        }
      }
      return files + '\n}'
    } catch (error) { console.error('Error getting current workspace files:', error); }
  }

  async writeGenerationResults(payload) {
    try {
      let modifiedFilesMarkdown = '## Modified Files\n'
      for (const file of payload.files) {
        if (!Object.values(SupportedFileExtensions).some(ext => file.fileName.endsWith(ext))) continue;
        // const fileContent = await this.plugin.call('codeFormatter', 'format', file.fileName, file.content, true);
        await this.plugin.call('editor', 'showCustomDiff', file.fileName, file.content)
        modifiedFilesMarkdown += `- ${file.fileName}\n`
      }
      return modifiedFilesMarkdown
    } catch (error) {
      console.error('Error writing generation results:', error);
      return 'No files modified'
    }
  }

  async setCtxFiles (context: IContextType) {
    this.ctxFiles = ""
    switch (context.context) {
    case 'currentFile': {
      const file = await this.plugin.call('fileManager', 'getCurrentFile')
      const content = await this.plugin.call('fileManager', 'readFile', file)
      this.ctxFiles = `"${file}": ${JSON.stringify(content)}`
      break
    }
    case 'workspace':
      this.ctxFiles = await this.getCurrentWorkspaceFiles()
      break
    case 'openedFiles': {
      this.ctxFiles = "{\n"
      const openedFiles = await this.plugin.call('fileManager', 'getOpenedFiles')
      Object.keys(openedFiles).forEach(key => {
        if (!Object.values(SupportedFileExtensions).some(ext => key.endsWith(ext))) return;
        this.ctxFiles += `"${key}": ${JSON.stringify(openedFiles[key])},\n`
      });
      this.ctxFiles += "\n}"
      break
    }
    default:
      this.ctxFiles = ""
      break
    }

    if (context.files){
      for (const file of context.files) {
        if (!Object.values(SupportedFileExtensions).some(ext => file.fileName.endsWith(ext))) continue;
        this.ctxFiles += `"${file.fileName}": ${JSON.stringify(file.content)},\n`
      }

    }
  }
}
