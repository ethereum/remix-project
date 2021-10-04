/* global */
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import * as packageJson from '../../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine-web'
import { RemixUiHomeTab } from '@remix-ui/home-tab' // eslint-disable-line

const yo = require('yo-yo')
const globalRegistry = require('../../../global/registry')
const GistHandler = require('../../../lib/gist-handler')

const profile = {
  name: 'home',
  displayName: 'Home',
  methods: [],
  events: [],
  description: ' - ',
  icon: 'assets/img/remixLogo.webp',
  location: 'mainPanel',
  version: packageJson.version
}
export class LandingPage extends ViewPlugin {
  constructor (appManager, verticalIcons, fileManager, filePanel, contentImport) {
    super(profile)
    this.profile = profile
    this.fileManager = fileManager
    this.filePanel = filePanel
    this.contentImport = contentImport
    this.appManager = appManager
    this.verticalIcons = verticalIcons
    this.gistHandler = new GistHandler()
    this.el = document.createElement('div')
    this.el.setAttribute('id', 'landingPageHomeContainer')
    this.el.setAttribute('class', 'remixui_homeContainer justify-content-between bg-light d-flex')
    this.el.setAttribute('data-id', 'landingPageHomeContainer')
    // to retrieve medium posts
    document.body.appendChild(yo`<script src="https://www.twilik.com/assets/retainable/rss-embed/retainable-rss-embed.js"></script>`)
    document.body.appendChild(yo`<script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>`)
  }

  render () {
    this.renderComponent()
    return this.el
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiHomeTab
        plugin={this}
        registry={globalRegistry}
      />
      , this.el)
  }
}
