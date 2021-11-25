/* global Node, requestAnimationFrame */   // eslint-disable-line
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom' // eslint-disable-line
import { RemixUiMainPanel } from '@remix-ui/main-panel' // eslint-disable-line
import { AbstractPanel } from './panel'
import * as packageJson from '../../../../../package.json'
// const yo = require('yo-yo')
// const csjs = require('csjs-inject')

// const css = csjs`
//   .pluginsContainer {
//     height: 100%;
//     display: flex;
//     overflow-y: hidden;
//   }
// `

const profile = {
  name: 'mainPanel',
  displayName: 'Main Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class MainPanel extends AbstractPanel {
  constructor (config) {
    super(profile)
    this.element = document.createElement('div')
    this.config = config
  }

  focus (name) {
    this.emit('focusChanged', name)
    super.focus(name)
  }

  onActivation () {
    this.renderComponent()
  }

  getTheme () {
    return this.config.get('settings/theme')
  }

  render () {
    return this.element
    // return yo`
    //   <div class=${css.pluginsContainer} data-id="mainPanelPluginsContainer" id='mainPanelPluginsContainer-id'>
    //     ${this.view}
    //   </div>`
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiMainPanel
        plugin={this}
      />,
      this.element
    )
  }
}
