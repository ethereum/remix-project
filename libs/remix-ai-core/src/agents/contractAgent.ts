import { parse } from "path";
import { AssistantParams } from "../types/models";

const compilationParams = {
  optimize: false,
  evmVersion: null,
  language: 'Solidity',
  version: '0.8.29+commit.ab55807c'
}

interface CompilationResult {
  compilationSucceeded: boolean
  errors: string
}

export class ContractAgent {
  plugin: any;
  readonly generationAttempts: number = 5
  nAttempts: number = 0
  generationThreadID: string= ''
  workspaceName: string = ''
  contracts: any = {}
  performCompile: boolean = true
  static instance
  oldPayload: any = undefined

  private constructor(props) {
    this.plugin = props;
    AssistantParams.provider = this.plugin.assistantProvider
  }

  public static getInstance(props) {
    if (ContractAgent.instance) return ContractAgent.instance
    ContractAgent.instance = new ContractAgent(props)
    return ContractAgent.instance
  }

  async writeContracts(payload, userPrompt) {
    console.log('payload', payload)
    const currentWorkspace = await this.plugin.call('filePanel', 'getCurrentWorkspace')

    const writeAIResults = async (parsedResults) => {await this.createWorkspace(this.workspaceName)
      await this.plugin.call('filePanel', 'switchToWorkspace', { name: this.workspaceName, isLocalHost: false })
      const dirCreated = []
      for (const file of parsedResults.files) {
        const dir = file.fileName.split('/').slice(0, -1).join('/')
        if (!dirCreated.includes(dir) && dir) {
          await this.plugin.call('fileManager', 'mkdir', dir)
          dirCreated.push(dir)
        }
        await this.plugin.call('fileManager', 'writeFile', file.fileName, file.content)
        await this.plugin.call('codeFormatter', 'format', file.fileName)
        // recompile to have it in the workspace
        // await this.plugin.call('solidity' as any, 'setCompilerConfig', compilationParams)
        // await this.plugin.call('solidity' as any, 'compile', file.fileName)
      }
      this.oldPayload = undefined
      if (this.performCompile) return "New workspace created: **" + this.workspaceName + "**\nUse the Hamburger menu to select it!"
      return "**New workspace created: **" + this.workspaceName + "**\nUse the Hamburger menu to select it!\n\n⚠️**Warning**: The compilation failed. Please check the compilation errors in the Remix IDE."
    }

    try {
      if (payload === undefined) {
        this.nAttempts += 1
        console.log('No payload, trying again')
        if (this.nAttempts > this.generationAttempts) {
          this.performCompile = false
          console.log('Max attempts reached, returning the result')
          if (this.oldPayload) {
            return await writeAIResults(this.oldPayload)
          }
          return "Max attempts reached! Please try again with a different prompt."
        }
        return await this.plugin.generate(userPrompt, AssistantParams)
      }
      this.contracts = {}
      const parsedFiles = payload
      this.oldPayload = payload
      this.generationThreadID = parsedFiles['threadID']
      this.workspaceName = parsedFiles['projectName']

      this.nAttempts += 1
      if (this.nAttempts > this.generationAttempts) {
        this.performCompile = false
        console.log('Max attempts reached, returning the result')
        return await writeAIResults(parsedFiles)
      }

      for (const file of parsedFiles.files) {
        if (file.fileName.endsWith('.sol')) {
          console.log('adding file', file.fileName, ' to compilation')
          this.contracts[file.fileName] = { content: file.content }
        }
      }

      const result:CompilationResult = await this.compilecontracts()
      console.log('compilation result', result)
      if (!result.compilationSucceeded && this.performCompile) {
        const newPrompt = `Try this again:${userPrompt}\n while considering this compilation error: Here is the error message\n ${result.errors}. `
        return await this.plugin.generate(newPrompt, AssistantParams, this.generationThreadID); // reuse the same thread
      }

      console.log('All source files compile')
      return await writeAIResults(parsedFiles)
    } catch (error) {
      console.error('Error writing generation results:', error)
      this.deleteWorkspace(this.workspaceName )
      this.nAttempts = 0
      this.performCompile = true
      await this.plugin.call('filePanel', 'switchToWorkspace', currentWorkspace)
      return "Failed to generate secure code on user prompt! Please try again with a different prompt."
    } finally {
      this.nAttempts = 0
      this.performCompile = true
    }

  }

  async createWorkspace(workspaceName) {
    // create random workspace surfixed with timestamp
    const timestamp = new Date().getTime()
    const wsp_name = workspaceName + '-' + timestamp
    await this.plugin.call('filePanel', 'createWorkspace', wsp_name, true)
    this.workspaceName = wsp_name
  }

  deleteWorkspace(workspaceName) {
    this.plugin.call('filePanel', 'deleteWorkspace', workspaceName)
  }

  async compilecontracts(): Promise<CompilationResult> {
    // do not compile tests files
    try {
      console.log('Compiling contracts:', this.contracts)
      const result = await this.plugin.call('solidity' as any, 'compileWithParameters', this.contracts, compilationParams)
      console.log('Compilation result:', result)
      const data = result.data
      let error = false

      // TODO check for data.error additionally
      if (data.errors) {
        console.log('Compilation errors:', data.errors)
        error = data.errors.find((error) => error.type !== 'Warning')
      }
      if (data.errors && data.errors.length && error) {
        const msg = `
          - Compilation errors: ${data.errors.map((e) => e.formattedMessage)}.
          `
        return { compilationSucceeded: false, errors: msg }
      }

      return { compilationSucceeded: true, errors: null }
    } catch (err) {
      console.error('Error during compilation:', err)
      return { compilationSucceeded: false, errors: 'An unexpected error occurred during compilation.' }
    }
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