import { ElectronPlugin } from '@remixproject/engine-electron'
import { IModel, ModelType, DefaultModels } from '@remix/remix-ai-core';
import axios from 'axios';
import fs from 'fs';

const desktop_profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
  icon: 'assets/img/remix-logo-blue.png',
  methods: ['downloadModel'],
}

export class remixAIDesktopPlugin extends ElectronPlugin {
  selectedModel: IModel | null = DefaultModels()[0]
  constructor() {
    console.log('remixAIDesktopPlugin loaded')
    super(desktop_profile)

    this
    
  }

  onActivation(): void {
    this.on('remixAI', 'enabled', () => {console.log('someone enable the remixAI desktop plugin')} )
    console.log('remixAIDesktopPlugin ---------------------- activated')
    console.log('remixAIDesktopPlugin Model: ', this.selectedModel)  
  }

  
  
}

// class RemixAIPlugin extends ElectronPlugin {
//   constructor() {
//     super(dek)
//     this.methods = ['downloadModel']
//   }
// }