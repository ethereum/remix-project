import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import ReactDOM from 'react-dom' // eslint-disable-line
import { RemixPanel } from '@remix-ui/side-panel'
import packageJson from '../../../../../package.json'

const profile = {
  name: 'mainPanel',
  displayName: 'Main Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class MainPanel extends AbstractPanel {
    element: HTMLDivElement
    constructor (config) {
      super(profile)
      this.element = document.createElement('div')
      this.element.setAttribute('class', 'mainPanelPluginsContainer')
      // this.config = config
    }

    onActivation () {
      this.renderComponent()
    }

    focus (name) {
      this.emit('focusChanged', name)
      super.focus(name)
      this.renderComponent()
    }

    addView (profile, view) {
      super.addView(profile, view)
      this.renderComponent()
    }

    removeView (profile) {
      super.removeView(profile)
      this.renderComponent()
    }

    async showContent (name) {
      super.showContent(name)
      this.renderComponent()
    }

    render () {
      return this.element
    }

    renderComponent () {
      ReactDOM.render(<RemixPanel plugins={this.plugins}/>, this.element)
    }
}
