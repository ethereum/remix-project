// eslint-disable-next-line no-use-before-define
import React from 'react'
import ReactDOM from 'react-dom' // eslint-disable-line
import { AbstractPanel } from './panel'
import * as packageJson from '../../../../../package.json'
import { RemixPanel } from '@remix-ui/panel'

const profile = {
  name: 'hiddenPanel',
  displayName: 'Hidden Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class HiddenPanel extends AbstractPanel {
  el: HTMLElement
  constructor () {
    super(profile)
    this.el = document.createElement('div')
    this.el.setAttribute('class', 'pluginsContainer')
  }

  addView (profile: any, view: any): void {
    super.removeView(profile)
    super.addView(profile, view)
    this.renderComponent()
  }

  render () {
    console.log(this.el)
    return this.el
  }

  renderComponent () {
    ReactDOM.render(<RemixPanel header={<></>} plugins={this.plugins}/>, this.el)
  }
}
