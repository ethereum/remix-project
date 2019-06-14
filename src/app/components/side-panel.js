import { AbstractPanel } from './panel'
const csjs = require('csjs-inject')
const yo = require('yo-yo')

const css = csjs`
  .panel {
    height: 100%;
    overflow-y: hidden; 
  }
  .swapitTitle {
    margin: 0;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .swapitTitle i{
    padding-left: 6px;
    font-size: 14px;
  }
  .swapitHeader {
    height: 35px;
    padding: 0 20px;
    display: flex;
    align-items: center;
  }
  .icons i {
    height: 80%;
    cursor: pointer;
  }
  .pluginsContainer {
    height: calc(100% - 35px);
    overflow: auto;
  }
  .titleInfo {
    padding-left: 10px;
  }
  .versionWarning {
    background-color: var(--light);
    padding: 0 7px;
    font-weight: bolder;
    margin-left: 5px;
    text-transform: lowercase;
    cursor: default;
  }
`

const options = {
  default: true
}

export class SidePanel extends AbstractPanel {

  constructor (appStore) {
    super('sidePanel', appStore, options)
    this.header = this.renderHeader()
    this.store = appStore
  }

  /**
   * Display content and update the header
   * @param {String} name The name of the plugin to display
   */
  showContent (name) {
    super.showContent(name)
    yo.update(this.header, this.renderHeader())
  }

  /** The header of the side panel */
  renderHeader () {
    let name = ' - '
    let docLink = ''
    let versionWarning
    if (this.active) {
      const { profile } = this.store.getOne(this.active)
      name = profile.displayName ? profile.displayName : profile.name
      docLink = profile.documentation ? yo`<a href="${profile.documentation}" class="${css.titleInfo}" title="link to documentation" target="_blank"><i aria-hidden="true" class="fas fa-book"></i></a>` : ''
      if (profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)) {
        versionWarning = yo`<small title="Version Alpha" class="${css.versionWarning}">alpha</small>`
      }
      // Beta
      if (profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)) {
        versionWarning = yo`<small title="Version Beta" class="${css.versionWarning}">beta</small>`
      }
    }

    return yo`
      <header class="${css.swapitHeader}">
          <h6 class="${css.swapitTitle}">${name}</h6>
          ${docLink}
          ${versionWarning}
      </header>
    `
  }

  render () {
    return yo`
      <section class="${css.panel}">
        ${this.header}
        <div class="${css.pluginsContainer}">
          ${this.view}
        </div>
      </section>`
  }
}
