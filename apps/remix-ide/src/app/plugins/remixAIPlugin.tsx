import * as packageJson from '../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine-web'
import { Plugin } from '@remixproject/engine';
import { RemixAITab } from '@remix-ui/remix-ai'
import React from 'react';
import { ICompletions, IModel, RemoteInferencer } from '@remix/remix-ai-core';

const profile = {
  name: 'remixAI',
  displayName: 'Remix AI',
  methods: ['code_generation', 'code_completion',
    "solidity_answer", "code_explaining",
    "code_insertion", "error_explaining",
    "initializeRemixAI"],
  events: [],
  icon: 'assets/img/remix-logo-blue.png',
  description: 'RemixAI provides AI services to Remix IDE.',
  kind: '',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

export class RemixAIPlugin extends ViewPlugin {
  isOnDesktop:boolean = false
  aiIsActivated:boolean = false
  selectedModel:IModel = null
  readonly remixDesktopPluginName = 'remixAID'
  remoteInferencer:RemoteInferencer = null

  constructor(inDesktop:boolean) {
    console.log('remixAIPlugin loaded')
    super(profile)
    this.isOnDesktop = inDesktop

    // not user machine ressource for remote inferencing
  }

  onActivation(): void {
    if (this.isOnDesktop) {
      console.log('Activating RemixAIPlugin on desktop')
    } else {
      console.log('Activating RemixAIPlugin on browser')
    }
  }

  async initializeRemixAI(model: IModel) {
    this.selectedModel = model

    if (this.isOnDesktop) {
      this.call(this.remixDesktopPluginName, 'initializeModelBackend', this.selectedModel)
    } else {
      // on browser
      console.log('Initializing RemixAIPlugin on browser')
      this.remoteInferencer = new RemoteInferencer(this)
    }

    this.aiIsActivated = true
    return true
  }

  async code_generation(prompt: string): Promise<any> {
    if (this.isOnDesktop) {
      return this.call(this.remixDesktopPluginName, 'code_generation', prompt)
    } else {
      return this.remoteInferencer.code_generation(prompt)
    }
  }

  async code_completion(prompt: string): Promise<any> {
    if (this.isOnDesktop) {
      return this.call(this.remixDesktopPluginName, 'code_completion', prompt)
    } else {
      return this.remoteInferencer.code_completion(prompt)
    }
  }

  async solidity_answer(prompt: string): Promise<any> {
    if (this.isOnDesktop) {
      return this.call(this.remixDesktopPluginName, 'solidity_answer', prompt)
    } else {
      return this.remoteInferencer.solidity_answer(prompt)
    }
  }

  async code_explaining(prompt: string): Promise<any> {
    if (this.isOnDesktop) {
      return this.call(this.remixDesktopPluginName, 'code_explaining', prompt)
    } else {
      return this.remoteInferencer.code_explaining(prompt)
    }
  }

  async error_explaining(prompt: string): Promise<any> {
    if (this.isOnDesktop) {
      return this.call(this.remixDesktopPluginName, 'error_explaining', prompt)
    } else {
      return this.remoteInferencer.error_explaining(prompt)
    }
  }

  async code_insertion(msg_pfx: string, msg_sfx: string): Promise<any> {
    if (this.isOnDesktop) {
      return this.call(this.remixDesktopPluginName, 'code_insertion', msg_pfx, msg_sfx)
    } else {
      return this.remoteInferencer.code_insertion(msg_pfx, msg_sfx)
    }
  }

  render() {
    return (
      <RemixAITab plugin={this}></RemixAITab>
    )
  }
}
