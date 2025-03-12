import { parse } from "path";

const compilationParams = {
  optimize: false,
  evmVersion: null,
  language: 'Solidity',
  version: '0.8.28+commit.7893614a'
}

interface CompilationResult {
  compilationSucceeded: boolean
  errors: string
}

export class ContractAgent {
  plugin: any;
  readonly generationAttempts: number = 3
  nAttempts: number = 0
  generationThreadID: string= ''
  workspaceName: string = ''

  constructor(props) {
    this.plugin = props;
  }

  async writeContracts(payload, userPrompt) {
    try {
      console.log('Writing contracts', payload)
      const parsedFiles = payload
      this.generationThreadID = parsedFiles['threadID']
      this.workspaceName = parsedFiles['projectName']

      this.nAttempts += 1
      if (this.nAttempts > this.generationAttempts) {
        console.error('Failed to generate the code')
        return "Failed to generate secure code on this prompt ````" + userPrompt + "````"
      }

      const contracts = {}
      for (const file of parsedFiles.files) {
        if (file.fileName.endsWith('.sol')) {
          const result:CompilationResult = await this.compilecontracts(file.fileName, file.content)
          console.log('compilation result', result)
          if (!result.compilationSucceeded) {
            // nasty recursion
            console.log('compilation failed')
            // const newPrompt = `I couldn't compile the contract ${file.fileName}. ${result.errors}. Please try again.`
            // await this.plugin.call('remixAI', 'generate', newPrompt, this.generationThreadID); // reuse the same thread
          }
        }
      }

      console.log('All source files are compiling')
      return "New workspace created: " + this.workspaceName + "\nUse the Hamburger menu to select it!"
    } catch (error) {
      console.log('Error writing contracts', error)
      this.deleteWorkspace(this.workspaceName )
      return "Failed to generate secure code on this prompt ```" + userPrompt + "```"
    }

  }

  createWorkspace(workspaceName) {
    // first get the workspace names
    const ws = this.plugin.call('filePanel', 'getWorkspaces')

    if (ws.includes(workspaceName)) {
      const newWorkspaceName = workspaceName + '_1'
      ws.includes(newWorkspaceName) ?
        this.plugin.call('filePanel', 'createWorkspace', newWorkspaceName+'_1', true)
        : this.plugin.call('filePanel', 'createWorkspace', workspaceName, true)
    }
    this.plugin.call('filePanel', 'createWorkspace', workspaceName, true)
  }

  deleteWorkspace(workspaceName) {
    this.plugin.call('filePanel', 'deleteWorkspace', workspaceName)
  }

  async compilecontracts(fileName, fileContent): Promise<CompilationResult> {

    const contract = {}
    contract[fileName] = { content : fileContent }
    console.log('compiling contract', contract)
    const result = await this.plugin.call('solidity' as any, 'compileWithParameters', contract, compilationParams)
    console.log('compilation result', result)
    const data = result.data
    const error = data.errors.find((error) => error.type !== 'Warning')
    if (data.errors && data.errors.length && error) {
      const msg = `
        - Compilation errors: ${data.errors.map((e) => e.formattedMessage)}.
        `
      return { compilationSucceeded: false, errors: msg }

    }

    return { compilationSucceeded: true, errors: null }
  }

  extractImportPaths(text) {

    // Define the regex pattern to match import paths
    const regex = /import\s*\"([^\"]+)\"\s*;/g;
    const paths = [];
    let match;

    // Use the regex to find all matches in the text
    while ((match = regex.exec(text)) !== null) {
      // Push the captured path to the paths array
      paths.push(match[1]);
    }

    return paths;
  }

}