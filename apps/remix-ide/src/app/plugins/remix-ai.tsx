import { RemixAITab } from '@remix-ui/remix-ai'

import { ViewPlugin } from '@remixproject/engine-web'
import { Plugin } from '@remixproject/engine';

import React from 'react' // eslint-disable-line
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'remixai',
  displayName: 'Remix AI',
  methods: [''],
  events: [],
  icon: 'assets/img/remixai_icon.webp',
  description: 'Remix AI',
  kind: '',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

export class RemixAIPlugin extends Plugin {
  constructor() {
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
