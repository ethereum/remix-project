import { AbstractPanel } from './panel'
import * as packageJson from '../../../package.json'
const csjs = require('csjs-inject')
const yo = require('yo-yo')

const css = csjs`
  .panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: auto;
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
    display: flex;
    align-items: center;
  }
  .icons i {
    height: 80%;
    cursor: pointer;
  }
  .pluginsContainer {
    height: 100%;
    overflow-y: auto;
  }
  .titleInfo {
    padding-left: 10px;
  }
  .versionBadge {
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

const sidePanel = {
  name: 'sidePanel',
  displayName: 'Side Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

// TODO merge with vertical-icons.js
export class SidePanel extends AbstractPanel {

  constructor (appManager, verticalIcons) {
    super(sidePanel, options)
    this.appManager = appManager
    this.header = this.renderHeader()
    this.verticalIcons = verticalIcons

    // Toggle content
    verticalIcons.events.on('toggleContent', (name) => {
      if (!this.contents[name]) return
      if (this.active === name) {
        // TODO: Only keep `this.emit` (issue#2210)
        this.emit('toggle', name)
        this.events.emit('toggle', name)
        return
      }
      this.showContent(name)
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('showing', name)
      this.events.emit('showing', name)
    })
    // Force opening
    verticalIcons.events.on('showContent', (name) => {
      if (!this.contents[name]) return
      this.showContent(name)
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('showing', name)
      this.events.emit('showing', name)
    })
  }

  removeView (profile) {
    super.removeView(profile)
    this.verticalIcons.unlinkContent(profile)
  }

  addView (profile, view) {
    super.addView(profile, view)
    this.verticalIcons.linkContent(profile)
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
      const { profile } = this.appManager.getPlugin(this.active)
      name = profile.displayName ? profile.displayName : profile.name
      docLink = profile.documentation ? yo`<a href="${profile.documentation}" class="${css.titleInfo}" title="link to documentation" target="_blank"><i aria-hidden="true" class="fas fa-book"></i></a>` : ''
      if (profile.version && profile.version.match(/\b(\w*alpha\w*)\b/g)) {
        versionWarning = yo`<small title="Version Alpha" class="badge-light ${css.versionBadge}">alpha</small>`
      }
      // Beta
      if (profile.version && profile.version.match(/\b(\w*beta\w*)\b/g)) {
        versionWarning = yo`<small title="Version Beta" class="badge-light ${css.versionBadge}">beta</small>`
      }
    }

    return yo`
      <header class="${css.swapitHeader} px-3">
        <h6 class="${css.swapitTitle}" data-id="sidePanelSwapitTitle">${name}</h6>
        ${docLink}
        ${versionWarning}
      </header>
    `
  }

  render () {
    return yo`
      <section class="${css.panel} plugin-manager">
        ${this.header}
        <div class="${css.pluginsContainer}">
          ${this.view}
        </div>
      </section>`
  }
}
