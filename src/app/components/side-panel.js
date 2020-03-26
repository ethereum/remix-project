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
    display: flex;
    align-items: center;
    padding: 16px 24px 15px;
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
    super(sidePanel)
    this.appManager = appManager
    this.header = yo`<header></header>`
    this.renderHeader()
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
  async showContent (name) {
    super.showContent(name)
    this.renderHeader()
  }

  /** The header of the side panel */
  async renderHeader () {
    let name = ' - '
    let docLink = ''
    let versionWarning
    if (this.active) {
      const profile = await this.appManager.getProfile(this.active)
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

    const header = yo`
      <header class="${css.swapitHeader}">
        <h6 class="${css.swapitTitle}" data-id="sidePanelSwapitTitle">${name}</h6>
        ${docLink}
        ${versionWarning}
      </header>
    `
    yo.update(this.header, header)
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
