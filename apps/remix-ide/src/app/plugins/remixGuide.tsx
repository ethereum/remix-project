
import React from 'react'
import { ViewPlugin } from '@remixproject/engine-web'
import { PluginViewWrapper } from '@remix-ui/helper'
import { RemixAppManager } from '../../remixAppManager'
import { RemixUIGridView } from '@remix-ui/remix-ui-grid-view'
import { RemixUIGridSection } from '@remix-ui/remix-ui-grid-section'
import { RemixUIGridCell } from '@remix-ui/remix-ui-grid-cell'
import { ThemeKeys, ThemeObject } from '@microlink/react-json-view'
//@ts-ignore
const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'remixGuide',
  displayName: 'Remix Guide',
  description: 'Learn remix with videos',
  location: 'mainPanel',
  methods: ['showDetails'],
  events: []
}

export class RemixGuidePlugin extends ViewPlugin {
  dispatch: React.Dispatch<any> = () => { }
  appManager: RemixAppManager
  element: HTMLDivElement
  payload: any
  themeStyle: any
  theme: ThemeKeys | ThemeObject
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'remixGuideEl')    
  }

  async onActivation() {
    this.handleThemeChange()
    await this.call('tabs', 'focus', 'remixGuide')
    this.renderComponent()
    _paq.push(['trackEvent', 'plugin', 'activated', 'remixGuide'])
  }

  onDeactivation(): void {
  }

  async showDetails(sentPayload: any) {
    const contractName = Object.entries(sentPayload).find(([key, value]) => key)
    await this.call('tabs', 'focus', 'remixGuide')
    this.profile.displayName = `${contractName[0]}`
    this.payload = sentPayload
    const active = await this.call('theme', 'currentTheme')
    
    this.renderComponent()
  }

  private handleThemeChange() {
    this.on('theme', 'themeChanged', (theme: any) => {
    
      this.renderComponent()
    })
  }

  setDispatch(dispatch: React.Dispatch<any>): void {
    this.dispatch = dispatch
    this.renderComponent()
  }
  render() {
    return (
      <div className="bg-dark" id="remixGuide">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  renderComponent() {
    this.dispatch({
      ...this,
      ...this.payload,
      themeStyle: this.themeStyle,
      theme: this.theme
    })
  }

  updateComponent(state: any) {
    return (
      <RemixUIGridView
        plugin={this}
        styleList={""}
        logo='/assets/img/YouTubeLogo.webp'
        enableFilter={true}
        showUntagged={true}
        showPin={true}
        tagList={[
          ['beginner', 'danger'],
          ['advanced', 'warning'],
          ['AI', 'success'],
          ['plugins', 'secondary'],
          ['solidity', 'primary'],
          ['vyper', 'info'],
          ['L2', 'danger']
        ]}
        title='Remix Guide'
        description="Streamlined access to categorized video tutorials for mastering Remix IDE. From fundamentals to advanced techniques, level up your development skills with ease."
      //themeStyle={state.themeStyle}
      >
        <RemixUIGridSection
          plugin={this}
          title='Basics'
          hScrollable= {true}
        >
          <RemixUIGridCell
            plugin={this}
            title="first item"
            tagList={['L2', 'AI']}
            logo='/assets/img/soliditySurvey2023.webp'
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="next"
            pinned={true}
            tagList={['L2', 'plugins']}
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell> <RemixUIGridCell
            plugin={this}
            title="something"
            pinned={false}
            tagList={['solidity', 'plugins']}
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
            tagList={['solidity']}
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell> <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="Something very very long"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell> <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
        </RemixUIGridSection>
        <RemixUIGridSection
          plugin={this}
          title='Basics not scrollable'
          hScrollable= {false}
        >
          <RemixUIGridCell
            plugin={this}
            title="first item"
            logo='/assets/img/soliditySurvey2023.webp'
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="next"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell> <RemixUIGridCell
            plugin={this}
            title="something"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell> <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell> <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
          <RemixUIGridCell
            plugin={this}
            title="1"
          >
            <img src={'/assets/img/soliditySurvey2023.webp'} style={{height: '70px', width: '70px'}} alt=""></img>
          </RemixUIGridCell>
        </RemixUIGridSection>
      </RemixUIGridView>
    )
  }

}
