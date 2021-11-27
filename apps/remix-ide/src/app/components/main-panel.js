/* global Node, requestAnimationFrame */   // eslint-disable-line
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom' // eslint-disable-line
import { RemixUiMainPanel } from '@remix-ui/main-panel' // eslint-disable-line
import { AbstractPanel } from './panel'
import * as packageJson from '../../../../../package.json'

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

  render () {
    return this.element
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
