import { parse } from "path";
import { AssistantParams } from "../types/models";

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
  contracts: any = {}

  constructor(props) {
    this.plugin = props;
    AssistantParams.provider = this.plugin.assistantProvider
  }

  async writeContracts(payload, userPrompt) {
    const currentWorkspace = await this.plugin.call('filePanel', 'getCurrentWorkspace')
    try {
      console.log('Writing contracts', payload)
      this.contracts = {}
      const parsedFiles = payload
      this.generationThreadID = parsedFiles['threadID']
      this.workspaceName = parsedFiles['projectName']

      this.nAttempts += 1
      console.log('Attempts', this.nAttempts)
      console.log('Generation attempts', this.generationAttempts)
      if (this.nAttempts > this.generationAttempts) {
        console.error('Failed to generate the code')
        throw new Error('Failed to generate the code')
      }

      for (const file of parsedFiles.files) {
        if (file.fileName.endsWith('.sol')) {
          const result:CompilationResult = await this.compilecontracts(file.fileName, file.content)
          console.log('compilation result', result)
          if (!result.compilationSucceeded) {
            // nasty recursion
            console.log('compilation failed', file.fileName)
            const newPrompt = `The contract ${file.fileName} does not compile. Here is the error message; ${result.errors}. Try again with the same formatting!`
            await this.plugin.generate(newPrompt, AssistantParams, this.generationThreadID); // reuse the same thread
            throw new Error("Failed to generate secure code on this prompt ```" + userPrompt + "```")
          }
        }
      }

      console.log('All source files are compiling')
      await this.createWorkspace(this.workspaceName)
      await this.plugin.call('filePanel', 'switchToWorkspace', { name: this.workspaceName, isLocalHost: false })
      const dirCreated = []
      for (const file of parsedFiles.files) {
        console.log('Writing file', file.fileName)
        const dir = file.fileName.split('/').slice(0, -1).join('/')
        console.log('Creating directory', dir)
        if (!dirCreated.includes(dir) && dir) {
          console.log('Creating new directory', dir)
          await this.plugin.call('fileManager', 'mkdir', dir)
          dirCreated.push(dir)
        }
        await this.plugin.call('fileManager', 'writeFile', file.fileName, file.content)
        await this.plugin.call('codeFormatter', 'format', file.fileName)
        // recompile to have it in the workspace
        // await this.plugin.call('solidity' as any, 'setCompilerConfig', compilationParams)
        // await this.plugin.call('solidity' as any, 'compile', file.fileName)
      }
      this.nAttempts = 0
      return "New workspace created: **" + this.workspaceName + "**\nUse the Hamburger menu to select it!"
    } catch (error) {
      console.log('Error writing contracts', error)
      this.deleteWorkspace(this.workspaceName )
      this.nAttempts = 0
      await this.plugin.call('filePanel', 'switchToWorkspace', currentWorkspace)
      return "Failed to generate secure code on this prompt ```" + userPrompt + "```"
    }

  }

  async createWorkspace(workspaceName) {
    // create random workspace surfixed with timestamp
    const timestamp = new Date().getTime()
    workspaceName += '-' + timestamp
    await this.plugin.call('filePanel', 'createWorkspace', workspaceName, true)
    this.workspaceName = workspaceName
  }

  deleteWorkspace(workspaceName) {
    this.plugin.call('filePanel', 'deleteWorkspace', workspaceName)
  }

  async compilecontracts(fileName, fileContent): Promise<CompilationResult> {
    // do not compile tests files
    if (fileName.includes('tests/')) return { compilationSucceeded: true, errors: null }

    this.contracts[fileName] = { content : fileContent }
    console.log('compiling contract', this.contracts)
    const result = await this.plugin.call('solidity' as any, 'compileWithParameters', this.contracts, compilationParams)
    console.log('compilation result', result)
    const data = result.data
    let error = false

    if (data.errors) {
      error = data.errors.find((error) => error.type !== 'Warning')
    }
    if (data.errors && data.errors.length && error) {
      const msg = `
        - Compilation errors: ${data.errors.map((e) => e.formattedMessage)}.
        `
      return { compilationSucceeded: false, errors: msg }
    }

    return { compilationSucceeded: true, errors: null }
  }

  extractImportPaths(text) {
    // eslint-disable-next-line no-useless-escape
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