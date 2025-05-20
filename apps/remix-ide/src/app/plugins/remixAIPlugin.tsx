import * as packageJson from '../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine-web'
import { Plugin } from '@remixproject/engine';
import { RemixAITab, ChatApi } from '@remix-ui/remix-ai'
import React, { useCallback } from 'react';
import { ICompletions, IModel, RemoteInferencer, IRemoteModel, IParams, GenerationParams, AssistantParams, CodeExplainAgent, SecurityAgent } from '@remix/remix-ai-core';
import { CustomRemixApi } from '@remix-api'
import { PluginViewWrapper } from '@remix-ui/helper'
import { AlertModal } from '@remix-ui/app';
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
    "solidity_answer", "code_explaining", "generateWorkspace", "fixWorspaceErrors",
    "code_insertion", "error_explaining", "vulnerability_check", 'generate',
    "initialize", 'chatPipe', 'ProcessChatRequestBuffer', 'isChatRequestPending'],
  events: ['generatingWorkspace', 'generateWorkspaceDone'],
  icon: 'assets/img/remix-logo-blue.png',
  description: 'RemixAI provides AI services to Remix IDE.',
  kind: '',
  location: 'popupPanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/ai.html',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

// add Plugin<any, CustomRemixApi>
export class RemixAIPlugin extends ViewPlugin {
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
  assistantProvider: string = 'mistralai'
  useRemoteInferencer:boolean = false
  dispatch: any
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

    this.aiIsActivated = true
    return true
  }

  async code_generation(prompt: string): Promise<any> {
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      return await this.call(this.remixDesktopPluginName, 'code_generation', prompt)
    } else {
      return await this.remoteInferencer.code_generation(prompt)
    }
  }

  async code_completion(prompt: string, promptAfter: string): Promise<any> {
    if (this.completionAgent.indexer == null || this.completionAgent.indexer == undefined) await this.completionAgent.indexWorkspace()

    const currentFileName = await this.call('fileManager', 'getCurrentFile')
    const contextfiles = await this.completionAgent.getContextFiles(prompt)
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      return await this.call(this.remixDesktopPluginName, 'code_completion', prompt, promptAfter, contextfiles, currentFileName)
    } else {
      return await this.remoteInferencer.code_completion(prompt, promptAfter, contextfiles, currentFileName)
    }
  }

  async solidity_answer(prompt: string, params: IParams=GenerationParams): Promise<any> {
    let newPrompt = await this.codeExpAgent.chatCommand(prompt)
    // add workspace context
    newPrompt = this.workspaceAgent.ctxFiles === undefined || this.workspaceAgent.ctxFiles === "" ? newPrompt : "Using the following context: ```\n" + this.workspaceAgent.ctxFiles + "```\n\n" + newPrompt

    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'solidity_answer', newPrompt)
    } else {
      result = await this.remoteInferencer.solidity_answer(newPrompt)
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

  async error_explaining(prompt: string, context: string="", params: IParams=GenerationParams): Promise<any> {
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

  async generate(userPrompt: string, params: IParams=AssistantParams, newThreadID:string="", useRag:boolean=false): Promise<any> {
    params.stream_result = false // enforce no stream result
    params.threadId = newThreadID
    params.provider = this.assistantProvider

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
    this.emit('generatingWorkspace', userPrompt)
    let result
    if (this.isOnDesktop && !this.useRemoteInferencer) {
      result = await this.call(this.remixDesktopPluginName, 'generate', userPrompt, params)
    } else {
      result = await this.remoteInferencer.generate(userPrompt, params)
    }

    const genResult = this.contractor.writeContracts(result, userPrompt)
    this.emit('generateWorkspaceDone', genResult)
    return genResult
  }

  async generateWorkspace (userPrompt: string, params: IParams=AssistantParams, newThreadID:string="", useRag:boolean=false): Promise<any> {
    params.stream_result = false // enforce no stream result
    params.threadId = newThreadID
    params.provider = this.assistantProvider
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
    const files = this.workspaceAgent.ctxFiles === undefined || this.workspaceAgent.ctxFiles === "" ? await this.workspaceAgent.getCurrentWorkspaceFiles() : this.workspaceAgent.ctxFiles
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

  async code_insertion(msg_pfx: string, msg_sfx: string): Promise<any> {
    if (this.completionAgent.indexer == null || this.completionAgent.indexer == undefined) await this.completionAgent.indexWorkspace()

    const currentFileName = await this.call('fileManager', 'getCurrentFile')
    const contextfiles = await this.completionAgent.getContextFiles(msg_pfx)

    if (this.isOnDesktop && !this.useRemoteInferencer) {
      return await this.call(this.remixDesktopPluginName, 'code_insertion', msg_pfx, msg_sfx, contextfiles, currentFileName)
    } else {
      return await this.remoteInferencer.code_insertion( msg_pfx, msg_sfx, contextfiles, currentFileName)
    }
  }

  chatPipe(fn, prompt: string, context?: string, pipeMessage?: string){
    if (this.chatRequestBuffer == null){
      this.chatRequestBuffer = {
        fn_name: fn,
        prompt: prompt,
        context: context
      }
      if (pipeMessage) ChatApi.composer.send(pipeMessage)
      else {
        if (fn === "code_explaining") ChatApi.composer.send("Explain the current code")
        else if (fn === "error_explaining") ChatApi.composer.send("Explain the error")
        else if (fn === "solidity_answer") ChatApi.composer.send("Answer the following question")
        else if (fn === "vulnerability_check") ChatApi.composer.send("Is there any vulnerability in the pasted code?")
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

  isChatRequestPending(){
    return this.chatRequestBuffer != null
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  renderComponent () {
    this.dispatch({
      plugin: this,
    })
  }

  render() {
    return <div
      id='ai-view'
      className='h-100 d-flex'
      data-id='aichat-view'
      style={{
        minHeight: 'max-content',
      }}
    >
      <PluginViewWrapper plugin={this} />
    </div>
  }

  updateComponent(state) {
    return (
      <RemixAITab plugin={state.plugin}></RemixAITab>
    )
  }
}
