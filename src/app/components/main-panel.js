import { AbstractPanel } from './panel'
const yo = require('yo-yo')
const csjs = require('csjs-inject')

const css = csjs`
  .pluginsContainer {
    height: 100%;
    display: flex;
    overflow-y: hidden;
  }
`

export class MainPanel extends AbstractPanel {
  constructor (appStore, options) {
    super('mainPanel', appStore, options)
  }

  render () {
    return yo`
      <div class=${css.pluginsContainer}>
        ${this.view}
      </div>`
  }
}
