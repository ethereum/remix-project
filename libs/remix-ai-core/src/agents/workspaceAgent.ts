enum SupportedFileExtensions {
  solidity = '.sol',
  vyper = '.vy',
  circom = '.circom',
}

export class workspaceAgent {
  plugin: any
  currentWorkspace: string = ''
  static instance
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
      const documents = []
      const jsonDirsContracts = await this.plugin.call('fileManager', 'copyFolderToJson', '/').then((res) => res.contracts);
      for (const file in jsonDirsContracts.children) {
        if (!Object.values(SupportedFileExtensions).some(ext => file.endsWith(ext))) continue;
        documents.push({
          filename: file,
          content: jsonDirsContracts.children[file].content,
        });
      }
      return JSON.stringify(documents, null, 2);
    } catch (error) { console.error('Error getting current workspace files:', error); }
  }

  async writeGenerationResults(payload) {
    try {
      const parsedFiles = JSON.parse(payload)
      for (const file of parsedFiles.files) {
        console.log('writing file', file)
        // await this.plugin.call('fileManager', 'writeFile', file.fileName, file.content)
        // await this.plugin.call('codeFormatter', 'format', file.fileName)
      }
    } catch (error) { console.error('Error writing generation results:', error); }
  }
}