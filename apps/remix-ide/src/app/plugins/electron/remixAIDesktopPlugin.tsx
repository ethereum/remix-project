import { ElectronPlugin } from '@remixproject/engine-electron'
import { IModel, ModelType, DefaultModels } from '@remix/remix-ai-core';
import axios from 'axios';
import fs from 'fs';

const desktop_profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/ai.html',
  icon: 'assets/img/remix-logo-blue.png',
  methods: ['initializeModelBackend', 'code_completion', 'code_insertion', 'code_generation', 'code_explaining', 'error_explaining', 'answer'],
}

export class remixAIDesktopPlugin extends ElectronPlugin {
  constructor() {
    super(desktop_profile)
  }

  onActivation(): void {
    this.on('remixAI', 'enabled', () => {} )
    console.log('remixAIDesktopPlugin activated')
  }

}

// class RemixAIPlugin extends ElectronPlugin {
//   constructor() {
//     super(dek)
//     this.methods = ['downloadModel']
//   }
// }
