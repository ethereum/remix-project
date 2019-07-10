import { AbstractPanel } from './panel'
import * as packageJson from '../../../package.json'
const csjs = require('csjs-inject')
const yo = require('yo-yo')

const css = csjs`
  .pluginsContainer {
    display: none;
  }
`

const profile = {
  name: 'hiddenPanel',
  displayName: 'Hidden Panel',
  description: '',
  version: packageJson.version
}

export class HiddenPanel extends AbstractPanel {

  constructor () {
    super(profile)
  }

  render () {
    return yo`
      <div class=${css.pluginsContainer}>
        ${this.view}
      </div>`
  }
}
