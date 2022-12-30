'use strict'
import { Plugin } from '@remixproject/engine'
import { Build, buildSite } from './docgen/site';
import { render } from './docgen/render';
import { Config, defaults } from './docgen/config';
import { loadTemplates } from './docgen/templates';
import { SolcInput, SolcOutput } from 'solidity-ast/solc';

const profile = {
  name: 'docgen',
  desciption: 'solidity doc gen plugin for Remix',
  methods: ['docgen'],
  events: [''],
  version: '0.0.1'
}



export class DocGen extends Plugin {

  constructor() {
    super(profile)
  }

  onActivation(): void {
    //this.docgen([{ output: example, input: inp }])
    this.on('solidity', 'compilationFinished', (file, source, languageVersion, data, input, version) => {
      this.docgen([{ output: data, input: JSON.parse(input) }])
    })
  }

  async docgen(builds: Build[], userConfig?: Config): Promise<void> {
    const config = { ...defaults, ...userConfig };
    const templates = await loadTemplates(config.theme, config.root, config.templates);
    const site = buildSite(builds, config, templates.properties ?? {});
    const renderedSite = render(site, templates, config.collapseNewlines);
    for (const { id, contents } of renderedSite) {
      await this.call('fileManager', 'setFile', id, contents)
    }
  }


}