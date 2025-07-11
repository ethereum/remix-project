import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine';
import { IModel, RemoteInferencer, IRemoteModel, IParams, GenerationParams, AssistantParams, CodeExplainAgent, SecurityAgent, CompletionParams } from '@remix/remix-ai-core';
import { CodeCompletionAgent, ContractAgent, workspaceAgent, IContextType } from '@remix/remix-ai-core';
import axios from 'axios';
import { endpointUrls } from "@remix-endpoints-helper"
const _paq = (window._paq = window._paq || [])

type chatRequestBufferT<T> = {
  [key in keyof T]: T[key]
}

const profile = {
  name: 'remixAI',
  displayName: 'RemixAI',
  methods: ['code_generation', 'code_completion', 'setContextFiles',
    "answer", "code_explaining", "generateWorkspace", "fixWorspaceErrors",
    "code_insertion", "error_explaining", "vulnerability_check", 'generate',
    "initialize", 'chatPipe', 'ProcessChatRequestBuffer', 'isChatRequestPending',
    'resetChatRequestBuffer', 'setAssistantThrId',
    'getAssistantThrId', 'getAssistantProvider', 'setAssistantProvider'],
  events: [],
  icon: 'assets/img/remix-logo-blue.png',
  description: 'RemixAI provides AI services to Remix IDE.',
  kind: '',
  location: 'popupPanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/ai.html',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

// add Plugin<any, CustomRemixApi>
export class RemixAIPlugin extends Plugin {
  isOnDesktop:boolean = false
  aiIsActivated:boolean = false
  readonly remixDesktopPluginName = 'remixAID'
  remoteInferencer:RemoteInferencer = null
  isInferencing: boolean = false
  chatRequestBuffer: chatRequestBufferT<any> = null
  codeExpAgent: CodeExplainAgent
  securityAgent: SecurityAgent
  contractor: ContractAgent
  workspaceAgent: workspaceAgent
  assistantProvider: string = 'mistralai' // default provider
  assistantThreadId: string = ''
  useRemoteInferencer:boolean = false
  completionAgent: CodeCompletionAgent

  constructor(inDesktop:boolean) {
    super(profile)
    this.isOnDesktop = inDesktop
    // user machine dont use ressource for remote inferencing
  }

  onActivation(): void {

    if (this.isOnDesktop) {
      console.log('Activating RemixAIPlugin on desktop')
      // this.on(this.remixDesktopPluginName, 'activated', () => {
      this.useRemoteInferencer = true
      this.initialize(null, null, null, this.useRemoteInferencer);
      // })
    } else {
      console.log('Activating RemixAIPlugin on browser')
      this.useRemoteInferencer = true
      this.initialize()
    }
    this.completionAgent = new CodeCompletionAgent(this)
    this.securityAgent = new SecurityAgent(this)
    this.codeExpAgent = new CodeExplainAgent(this)
    this.contractor = ContractAgent.getInstance(this)
    this.workspaceAgent = workspaceAgent.getInstance(this)
  }

  async initialize(model1?:IModel, model2?:IModel, remoteModel?:IRemoteModel, useRemote?:boolean){
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      // on desktop use remote inferencer -> false
      const res = await this.call(this.remixDesktopPluginName, 'initializeModelBackend', useRemote, model1, model2)
      if (res) {
        this.on(this.remixDesktopPluginName, 'onStreamResult', (value) => {
          this.call('terminal', 'log', { type: 'log', value: value })
        })

        this.on(this.remixDesktopPluginName, 'onInference', () => {
          this.isInferencing = true
        })

        this.on(this.remixDesktopPluginName, 'onInferenceDone', () => {
          this.isInferencing = false
        })
      }

    } else {
      this.remoteInferencer = new RemoteInferencer(remoteModel?.apiUrl, remoteModel?.completionUrl)
      this.remoteInferencer.event.on('onInference', () => {
        this.isInferencing = true
      })
      this.remoteInferencer.event.on('onInferenceDone', () => {
        this.isInferencing = false
      })
    }
    this.setAssistantProvider(this.assistantProvider) // propagate the provider to the remote inferencer
    this.aiIsActivated = true
    return true
  }

  async code_generation(prompt: string, params: IParams=CompletionParams): Promise<any> {
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      return await this.call(this.remixDesktopPluginName, 'code_generation', prompt, params)
    } else {
      return await this.remoteInferencer.code_generation(prompt, params)
    }
  }

  async code_completion(prompt: string, promptAfter: string, params:IParams=CompletionParams): Promise<any> {
    if (this.completionAgent.indexer == null || this.completionAgent.indexer == undefined) await this.completionAgent.indexWorkspace()
    params.provider = 'mistralai' // default provider for code completion
    const currentFileName = await this.call('fileManager', 'getCurrentFile')
    const contextfiles = await this.completionAgent.getContextFiles(prompt)
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      return await this.call(this.remixDesktopPluginName, 'code_completion', prompt, promptAfter, contextfiles, currentFileName, params)
    } else {
      return await this.remoteInferencer.code_completion(prompt, promptAfter, contextfiles, currentFileName, params)
    }
  }

  async answer(prompt: string, params: IParams=GenerationParams): Promise<any> {

    let newPrompt = await this.codeExpAgent.chatCommand(prompt)
    // add workspace context
    newPrompt = !this.workspaceAgent.ctxFiles ? newPrompt : "Using the following context: ```\n" + this.workspaceAgent.ctxFiles + "```\n\n" + newPrompt

    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'answer', newPrompt)
    } else {
      result = await this.remoteInferencer.answer(newPrompt)
    }
    if (result && params.terminal_output) this.call('terminal', 'log', { type: 'aitypewriterwarning', value: result })

    if (prompt.trimStart().startsWith('gpt') || prompt.trimStart().startsWith('sol-gpt')) params.terminal_output = false
    return result
  }

  async code_explaining(prompt: string, context: string, params: IParams=GenerationParams): Promise<any> {
    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'code_explaining', prompt, context, params)

    } else {
      result = await this.remoteInferencer.code_explaining(prompt, context, params)
    }
    if (result && params.terminal_output) this.call('terminal', 'log', { type: 'aitypewriterwarning', value: result })
    return result
  }

  async error_explaining(prompt: string, params: IParams=GenerationParams): Promise<any> {
    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'error_explaining', prompt)
    } else {
      result = await this.remoteInferencer.error_explaining(prompt, params)
    }
    if (result && params.terminal_output) this.call('terminal', 'log', { type: 'aitypewriterwarning', value: result })
    return result
  }

  async vulnerability_check(prompt: string, params: IParams=GenerationParams): Promise<any> {
    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'vulnerability_check', prompt)

    } else {
      result = await this.remoteInferencer.vulnerability_check(prompt, params)
    }
    if (result && params.terminal_output) this.call('terminal', 'log', { type: 'aitypewriterwarning', value: result })
    return result
  }

  getVulnerabilityReport(file: string): any {
    return this.securityAgent.getReport(file)
  }

  /**
   * Generates a new remix IDE workspace based on the provided user prompt, optionally using Retrieval-Augmented Generation (RAG) context.
   * - If `useRag` is `true`, the function fetches additional context from a RAG API and prepends it to the user prompt.
   */
  async generate(userPrompt: string, params: IParams=AssistantParams, newThreadID:string="", useRag:boolean=false): Promise<any> {
    params.stream_result = false // enforce no stream result
    params.threadId = newThreadID
    params.provider = this.assistantProvider
    _paq.push(['trackEvent', 'ai', 'remixAI', 'GenerateNewAIWorkspace'])

    if (useRag) {
      try {
        let ragContext = ""
        const options = { headers: { 'Content-Type': 'application/json', } }
        const response = await axios.post(endpointUrls.rag, { query: userPrompt, endpoint:"query" }, options)
        if (response.data) {
          ragContext = response.data.response
          userPrompt = "Using the following context: ```\n\n" + JSON.stringify(ragContext) + "```\n\n" + userPrompt
        } else {
          console.log('Invalid response from RAG context API:', response.data)
        }
      } catch (error) {
        console.log('RAG context error:', error)
      }
    }
    // Evaluate if this function requires any context
    // console.log('Generating code for prompt:', userPrompt, 'and threadID:', newThreadID)
    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'generate', userPrompt, params)
    } else {
      result = await this.remoteInferencer.generate(userPrompt, params)
    }

    const genResult = this.contractor.writeContracts(result, userPrompt)
    this.call('menuicons', 'select', 'filePanel')
    return genResult
  }

  /**
   * Performs any user action on the entire curren workspace or updates the workspace based on a user prompt, optionally using Retrieval-Augmented Generation (RAG) for additional context.
   *
   */
  async generateWorkspace (userPrompt: string, params: IParams=AssistantParams, newThreadID:string="", useRag:boolean=false): Promise<any> {
    params.stream_result = false // enforce no stream result
    params.threadId = newThreadID
    params.provider = this.assistantProvider
    _paq.push(['trackEvent', 'ai', 'remixAI', 'WorkspaceAgentEdit'])
    if (useRag) {
      try {
        let ragContext = ""
        const options = { headers: { 'Content-Type': 'application/json', } }
        const response = await axios.post(endpointUrls.rag, { query: userPrompt, endpoint:"query" }, options)
        if (response.data) {
          ragContext = response.data.response
          userPrompt = "Using the following context: ```\n\n" + ragContext + "```\n\n" + userPrompt
        }
        else {
          console.log('Invalid response from RAG context API:', response.data)
        }
      } catch (error) {
        console.log('RAG context error:', error)
      }
    }
    const files = !this.workspaceAgent.ctxFiles ? await this.workspaceAgent.getCurrentWorkspaceFiles() : this.workspaceAgent.ctxFiles
    userPrompt = "Using the following workspace context: ```\n" + files + "```\n\n" + userPrompt

    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'generateWorkspace', userPrompt, params)
    } else {
      result = await this.remoteInferencer.generateWorkspace(userPrompt, params)
    }
    return (result !== undefined) ? this.workspaceAgent.writeGenerationResults(result) : "### No Changes applied!"
  }

  async fixWorspaceErrors(continueGeneration=false): Promise<any> {
    try {
      if (continueGeneration) {
        return this.contractor.continueCompilation()
      } else {
        return this.contractor.fixWorkspaceCompilationErrors(this.workspaceAgent)
      }
    } catch (error) {
    }
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, params:IParams=CompletionParams): Promise<any> {
    if (this.completionAgent.indexer == null || this.completionAgent.indexer == undefined) await this.completionAgent.indexWorkspace()

    params.provider = 'mistralai' // default provider for code completion
    const currentFileName = await this.call('fileManager', 'getCurrentFile')
    const contextfiles = await this.completionAgent.getContextFiles(msg_pfx)
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      return await this.call(this.remixDesktopPluginName, 'code_insertion', msg_pfx, msg_sfx, contextfiles, currentFileName, params)
    } else {
      return await this.remoteInferencer.code_insertion( msg_pfx, msg_sfx, contextfiles, currentFileName, params)
    }
  }

  chatPipe(fn, prompt: string, context?: string, pipeMessage?: string){
    if (this.chatRequestBuffer == null){
      this.chatRequestBuffer = {
        fn_name: fn,
        prompt: prompt,
        context: context
      }

      if (pipeMessage) this.call('remixaiassistant', 'chatPipe', pipeMessage)
      else {
        if (fn === "code_explaining") this.call('remixaiassistant', 'chatPipe',"Explain the current code")
        else if (fn === "error_explaining") this.call('remixaiassistant', 'chatPipe', "Explain the error")
        else if (fn === "answer") this.call('remixaiassistant', 'chatPipe', "Answer the following question")
        else if (fn === "vulnerability_check") this.call('remixaiassistant', 'chatPipe',"Is there any vulnerability in the pasted code?")
        else console.log("chatRequestBuffer function name not recognized.")
      }
    }
    else {
      console.log("chatRequestBuffer is not empty. First process the last request.", this.chatRequestBuffer)
    }
    _paq.push(['trackEvent', 'ai', 'remixAI', 'remixAI_chat'])
  }

  async ProcessChatRequestBuffer(params:IParams=GenerationParams){
    if (this.chatRequestBuffer != null){
      const result = this[this.chatRequestBuffer.fn_name](this.chatRequestBuffer.prompt, this.chatRequestBuffer.context, params)
      this.chatRequestBuffer = null
      return result
    }
    else {
      console.log("chatRequestBuffer is empty.")
      return ""
    }
  }

  async setContextFiles(context: IContextType) {
    this.workspaceAgent.setCtxFiles(context)
  }

  async setAssistantThrId(newThrId: string){
    this.assistantThreadId = newThrId
    AssistantParams.threadId = newThrId
    GenerationParams.threadId = newThrId
    CompletionParams.threadId = newThrId
  }

  async getAssistantThrId(){
    return this.assistantThreadId
  }

  async getAssistantProvider(){
    return this.assistantProvider
  }

  async setAssistantProvider(provider: string) {
    if (provider === 'openai' || provider === 'mistralai' || provider === 'anthropic') {
      GenerationParams.provider = provider
      CompletionParams.provider = provider
      AssistantParams.provider = provider

      if (this.assistantProvider !== provider){
        // clear the threadDds
        this.assistantThreadId = ''
        GenerationParams.threadId = ''
        CompletionParams.threadId = ''
        AssistantParams.threadId = ''
      }
      this.assistantProvider = provider
    } else {
      console.error(`Unknown assistant provider: ${provider}`)
    }
  }

  isChatRequestPending(){
    return this.chatRequestBuffer != null
  }

  resetChatRequestBuffer() {
    this.chatRequestBuffer = null
  }

}
