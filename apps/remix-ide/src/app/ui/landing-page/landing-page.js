/* global */
import React from 'react' // eslint-disable-line
import * as packageJson from '../../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine-web'
import { RemixUiHomeTab } from '@remix-ui/home-tab' // eslint-disable-line

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
    this.el = document.createElement('div')
    this.el.setAttribute('id', 'landingPageHomeContainer')
    this.el.setAttribute('class', 'remixui_homeContainer justify-content-between bg-light d-flex')
    this.el.setAttribute('data-id', 'landingPageHomeContainer')
  }

  render () {
    return <div id='landingPageHomeContainer' className='remixui_homeContainer justify-content-between bg-light d-flex' data-id='landingPageHomeContainer'><RemixUiHomeTab
    plugin={this}
  /></div>
  }

}
