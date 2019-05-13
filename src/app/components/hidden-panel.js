import { AbstractPanel } from './panel'
const csjs = require('csjs-inject')
const yo = require('yo-yo')

const css = csjs`
  .pluginsContainer {
    display: none;
  }
`

export class HiddenPanel extends AbstractPanel {

  constructor (appStore) {
    super('hiddenPanel', appStore)
  }

  render () {
    return yo`
      <div class=${css.pluginsContainer}>
        ${this.view}
      </div>`
  }
}
