import * as packageJson from '../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine-web'
import { Plugin } from '@remixproject/engine';
import { RemixAITab } from '@remix-ui/remix-ai'
import React from 'react';

const profile = {
  name: 'remixAI',
  displayName: 'Remix AI',
  methods: [''],
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
  constructor() {
    console.log('remixAIPlugin')
    super(profile)
  }

  render() {
    return (
      <div id="remixAITab">
        <RemixAITab plugin={this}></RemixAITab>
      </div>
    )
  }
}
