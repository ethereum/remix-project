import { Plugin } from '@remixproject/engine'
import * as templateWithContent from '@remix-project/remix-ws-templates'

const profile = {
  name: 'remix-templates',
  displayName: 'remix-templates',
  description: 'Remix Templates plugin',
  methods: ['getTemplate', 'loadTemplateInNewWindow', 'loadFilesInNewWindow'],
}

export class TemplatesPlugin extends Plugin {

  constructor() {
    super(profile)
  }

  async getTemplate (template: string, opts?: any) {
    const templateList = Object.keys(templateWithContent)
    if (!templateList.includes(template)) return
    // @ts-ignore
    const files = await templateWithContent[template](opts)
    return files
  }
  // electron only method
  async loadTemplateInNewWindow (template: string, opts?: any) {
    const files = await this.getTemplate(template, opts)
    this.call('electronTemplates', 'loadTemplateInNewWindow', files)
  }

  async loadFilesInNewWindow (files: any) {
    this.call('electronTemplates', 'loadTemplateInNewWindow', files)
  }
}

