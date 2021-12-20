import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import * as packageJson from '../../../../../package.json'
const csjs = require('csjs-inject')

const css = csjs`
  .pluginsContainer {
    display: none;
  }
`

const profile = {
  name: 'hiddenPanel',
  displayName: 'Hidden Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class HiddenPanel extends AbstractPanel {
  constructor () {
    super(profile)
    this.container = document.createElement('div')
  }

  render () {
    return this.container
  }

  renderComponent () {
    return ReactDOM.render(
      <div class={css.pluginsContainer}>
        {this.element}
      </div>
      ,
      this.container
    )
  }
}
