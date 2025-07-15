import { AssistantParams } from "../types/models";
import { workspaceAgent } from "./workspaceAgent";
import { CompilationResult } from "../types/types";
import { compilecontracts, compilationParams } from "../helpers/compile";
import { extractFirstLvlImports } from "../helpers/localImportsExtractor";

const COMPILATION_WARNING_MESSAGE = '⚠️**Warning**: The compilation failed. Please check the compilation errors in the Solidity compiler plugin. Enter `/continue` or `/c` if you want Remix AI to try again until a compilable solution is generated?'

export class ContractAgent {
  plugin: any;
  readonly generationAttempts: number = 5
  nAttempts: number = 0
  generationThreadID: string= ''
  workspaceName: string = ''
  contracts: any = {}
  static instance
  oldPayload: any = undefined
  mainPrompt: string

  private constructor(props) {
    this.plugin = props;
    AssistantParams.provider = this.plugin.assistantProvider
  }

  public static getInstance(props) {
    if (ContractAgent.instance) return ContractAgent.instance
    ContractAgent.instance = new ContractAgent(props)
    return ContractAgent.instance
  }

  /*
  * Write the result of the generation to the workspace. Compiles the contracts one time and creates a new workspace.
  * @param payload - The payload containing the generated files
  * @param userPrompt - The user prompt used to generate the files
  */
  async writeContracts(payload, userPrompt) {
    const currentWorkspace = await this.plugin.call('filePanel', 'getCurrentWorkspace')

    const writeAIResults = async (parsedResults) => {
      if (this.plugin.isOnDesktop) {
        const files = parsedResults.files.reduce((acc, file) => {
          acc[file.fileName] = file.content
          return acc
        }, {})
        await this.plugin.call('electronTemplates', 'loadTemplateInNewWindow', files)
        //return "Feature not only available in the browser version of Remix IDE. Please use the browser version to generate secure code."
        return "## New workspace created!  \nNavigate to the new window!"
      }

      await this.createWorkspace(this.workspaceName)
      const dirCreated = []
      for (const file of parsedResults.files) {
        const dir = file.fileName.split('/').slice(0, -1).join('/')
        if (!dirCreated.includes(dir) && dir) {
          await this.plugin.call('fileManager', 'mkdir', dir)
          dirCreated.push(dir)
        }
        // check if file already exists
        await this.plugin.call('fileManager', 'writeFile', file.fileName, file.content)
        await this.plugin.call('codeFormatter', 'format', file.fileName)
      }
      return "New workspace created: **" + this.workspaceName + "**\nUse the Hamburger menu to select it!"
    }

    try {
      if (payload === undefined) {
        this.nAttempts += 1
        if (this.nAttempts > this.generationAttempts) {
          if (this.oldPayload) {
            return await writeAIResults(this.oldPayload)
          }
          return "Max attempts reached! Please try again with a different prompt."
        }
        return "No payload, try again while considering changing the assistant provider with the command `/setAssistant <openai|anthorpic|mistralai>`"
      }
      this.contracts = {}
      const parsedFiles = payload
      this.oldPayload = payload
      this.generationThreadID = parsedFiles['threadID']
      this.workspaceName = parsedFiles['projectName']

      this.nAttempts += 1
      if (this.nAttempts === 1) this.mainPrompt = userPrompt

      if (this.nAttempts > this.generationAttempts) {
        return await writeAIResults(parsedFiles)
      }

      for (const file of parsedFiles.files) {
        if (file.fileName.endsWith('.sol')) {
          this.contracts[file.fileName] = { content: file.content }
        }
      }

      const result:CompilationResult = await compilecontracts(this.contracts, this.plugin)
      const imports = extractFirstLvlImports(parsedFiles, result)
      console.log('Extracted imports:', imports)
      if (!result.compilationSucceeded) {
        // console.log('Compilation failed, trying again recursively ...')
        // filter libraries
        const libs = imports.filter(imp => imp.isLibrary && imp.content !== undefined);
        const newPrompt = `
              Compilation parameters:\n${JSON.stringify(compilationParams)}\n\n
              Compiler libs :\n${JSON.stringify(libs)}}\n\n
              Compiler error payload:\n${JSON.stringify(result.errfiles)}}\n\n
              Generated contract files:\n${JSON.stringify(this.contracts)}\n\n
              While considering this compilation error and the provided libs above: Here is the error message.\n\n 
              Try this main prompt again: \n${this.mainPrompt}\n `

        console.log('New prompt for retry:', newPrompt)
        return await this.plugin.generate(newPrompt, AssistantParams, this.generationThreadID); // reuse the same thread
      }

      return result.compilationSucceeded ? await writeAIResults(parsedFiles) : await writeAIResults(parsedFiles) + "\n\n" + COMPILATION_WARNING_MESSAGE
    } catch (error) {
      this.deleteWorkspace(this.workspaceName )
      this.nAttempts = 0
      await this.plugin.call('filePanel', 'switchToWorkspace', currentWorkspace)
      return "Failed to generate secure code on user prompt! Please try again with a different prompt."
    } finally {
      this.nAttempts = 0
    }
  }

  async createWorkspace(workspaceName) {
    // create random workspace surfixed with timestamp
    try {
      const timestamp = new Date().getTime()
      const wsp_name = workspaceName + '-' + timestamp
      await this.plugin.call('filePanel', 'createWorkspace', wsp_name, true)
      this.workspaceName = wsp_name
    } catch (error) {
      console.error('Error creating workspace:', error)
    }
  }

  async deleteWorkspace(workspaceName) {
    await this.plugin.call('filePanel', 'deleteWorkspace', workspaceName)
  }

  async fixWorkspaceCompilationErrors(wspAgent:workspaceAgent) {
    try {
      const wspfiles = JSON.parse(await wspAgent.getCurrentWorkspaceFiles())
      const compResult:CompilationResult = await compilecontracts(wspfiles, this.plugin)
      // console.log('fix workspace Compilation result:', compResult)

      if (compResult.compilationSucceeded) {
        console.log('Compilation succeeded, no errors to fix')
        return 'Compilation succeeded, no errors to fix'
      }

      const newPrompt = `Payload:\n${JSON.stringify(compResult.errfiles)}}\n\n Fix the compilation errors above\n`
      return await this.plugin.generateWorkspace(newPrompt, AssistantParams, this.generationThreadID); // reuse the same thread, pass the paylod to the diff checker

    } catch (error) {
    } finally {
    }
  }

}
