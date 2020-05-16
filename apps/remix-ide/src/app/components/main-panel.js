import { AbstractPanel } from './panel'
import * as packageJson from '../../../package.json'
const yo = require('yo-yo')
const csjs = require('csjs-inject')

const css = csjs`
  .pluginsContainer {
    height: 100%;
    display: flex;
    overflow-y: hidden;
  }
`

const profile = {
  name: 'mainPanel',
  displayName: 'Main Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class MainPanel extends AbstractPanel {
  constructor () {
    super(profile)
  }

  render () {
    return yo`
      <div class=${css.pluginsContainer} data-id="mainPanelPluginsContainer">
        ${this.view}
      </div>`
  }
}
