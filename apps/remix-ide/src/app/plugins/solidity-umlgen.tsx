/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RemixUiSolidityUmlGen } from '@remix-ui/solidity-uml-gen' 
import { ISolidityUmlGen, ThemeQualityType, ThemeSummary } from 'libs/remix-ui/solidity-uml-gen/src/types'
import { RemixAppManager } from 'libs/remix-ui/plugin-manager/src/types'
import { concatSourceFiles, getDependencyGraph } from 'libs/remix-ui/solidity-compiler/src/lib/logic/flattenerUtilities'
import { convertUmlClasses2Dot } from 'sol2uml/lib/converterClasses2Dot'
import { convertAST2UmlClasses } from 'sol2uml/lib/converterAST2Classes'
import vizRenderStringSync from '@aduh95/viz.js/sync'
import { PluginViewWrapper } from '@remix-ui/helper'
import { customAction } from '@remixproject/plugin-api'
const parser = (window as any).SolidityParser

const _paq = window._paq = window._paq || []

const profile = {
    name: 'solidityumlgen',
    displayName: 'Solidity UML Generator',
    description: 'Generates UML diagram in svg format from last compiled contract',
    location: 'mainPanel',
    methods: ['showUmlDiagram', 'generateUml', 'generateCustomAction'],
    events: [],
}

const themeCollection = [
  { themeName: 'HackerOwl', backgroundColor: '--body-bg', actualHex: '#011628'},
  { themeName: 'Cerulean', backgroundColor: '--body-bg', actualHex: '#fff'},
  { themeName: 'Cyborg', backgroundColor: '--body-bg', actualHex: '#060606'},
  { themeName: 'Dark', backgroundColor: '--body-bg', actualHex: '#222336'},
  { themeName: 'Flatly', backgroundColor: '--body-bg', actualHex: '#fff'},
  { themeName: 'Black', backgroundColor: '--body-bg', actualHex: '#1a1a1a'},
  { themeName: 'Light', backgroundColor: '--body-bg', actualHex: '#eef1f6'},
  { themeName: 'Midcentuary', backgroundColor: '--body-bg', actualHex: '#DBE2E0'},
  { themeName: 'Spacelab', backgroundColor: '--body-bg', actualHex: '#fff'},
  { themeName: 'Candy', backgroundColor: '--body-bg', actualHex: '#d5efff'},
]

/**
 * add context menu which will offer download as pdf and download png.
 * add menu under the first download button to download
 */

export class SolidityUmlGen extends ViewPlugin implements ISolidityUmlGen {
  element: HTMLDivElement
  currentFile: string
  svgPayload: string
  updatedSvg: string
  currentlySelectedTheme: string
  themeName: string
  loading: boolean
  themeCollection: ThemeSummary[]

  appManager: RemixAppManager
  dispatch: React.Dispatch<any> = () => {}
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.currentFile = ''
    this.svgPayload = ''
    this.updatedSvg = ''
    this.loading = false
    this.currentlySelectedTheme = ''
    this.themeName = ''
    this.themeCollection = themeCollection
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'sol-uml-gen')
  }

  onActivation(): void {
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data, input, version) => {
      const currentTheme: ThemeQualityType = await this.call('theme', 'currentTheme')
      this.currentlySelectedTheme = currentTheme.quality
      this.themeName = currentTheme.name
      let result = ''
      try {
        if (data.sources && Object.keys(data.sources).length > 1) { // we should flatten first as there are multiple asts
          result = await this.flattenContract(source, this.currentFile, data)
        }
        const ast = result.length > 1 ? parser.parse(result) : parser.parse(source.sources[this.currentFile].content)
        const umlClasses = convertAST2UmlClasses(ast, this.currentFile)
        const umlDot = convertUmlClasses2Dot(umlClasses)
        const payload = vizRenderStringSync(umlDot)
        this.updatedSvg = payload
        _paq.push(['trackEvent', 'solidityumlgen', 'umlgenerated'])
        this.renderComponent()
        await this.call('tabs', 'focus', 'solidityumlgen')
      } catch (error) {
        console.log('error', error)
      }
    })
    this.on('theme', 'themeChanged', (theme) => {
      this.currentlySelectedTheme = theme.quality
      this.renderComponent()
    })
  }

  async mangleSvgPayload(svgPayload: string) : Promise<string> {
    const parser = new DOMParser()
    const themeQuality: ThemeQualityType = await this.call('theme', 'currentTheme')
    const parsedDocument = parser.parseFromString(svgPayload, 'image/svg+xml')
    const element = parsedDocument.getElementsByTagName('svg')
    themeCollection.forEach((theme) => {
      if (theme.themeName === themeQuality.name) {
        parsedDocument.documentElement.setAttribute('style', `background-color: var(${themeQuality.name === theme.themeName ? theme.backgroundColor : '--body-bg'})`)
        element[0].setAttribute('fill', theme.actualHex)
      }
    })
    const stringifiedSvg = new XMLSerializer().serializeToString(parsedDocument)
    return stringifiedSvg
  }

  onDeactivation(): void {
    this.off('solidity', 'compilationFinished')
  }

  generateCustomAction = async (action: customAction) => {
    this.updatedSvg = this.updatedSvg.startsWith('<?xml') ? '' : this.updatedSvg
    this.currentFile = action.path[0]
    _paq.push(['trackEvent', 'solidityumlgen', 'activated'])
    await this.generateUml(action.path[0])
  }

  async generateUml(currentFile: string) {
    await this.call('solidity', 'compile', currentFile)
    await this.call('tabs', 'focus', 'solidityumlgen')
    this.loading = true
    this.renderComponent()
  }

  /**
   * Takes currently compiled contract that has a bunch of imports at the top
   * and flattens them ready for UML creation. Takes the flattened result
   * and assigns to a local property
   * @returns {Promise<string>}
   */
  async flattenContract (source: any, filePath: string, data: any) {
    const dependencyGraph = getDependencyGraph(data.sources, filePath)
    const sorted = dependencyGraph.isEmpty()
        ? [filePath]
        : dependencyGraph.sort().reverse()
    const result = concatSourceFiles(sorted, source.sources)
    await this.call('fileManager', 'writeFile', `${filePath}_flattened.sol`, result)
    return result
  }

  async showUmlDiagram(svgPayload: string) {
    this.updatedSvg = svgPayload
    this.renderComponent()
  }

  hideSpinner() {
    this.loading = false
    this.renderComponent()
  }

  setDispatch (dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  render() {
    return <div id='sol-uml-gen'>
      <PluginViewWrapper plugin={this} />
    </div>
  }

  renderComponent () {
    this.dispatch({
      ...this,
      updatedSvg: this.updatedSvg,
      loading: this.loading,
      themeSelected: this.currentlySelectedTheme,
      themeName: this.themeName,
      fileName: this.currentFile,
      themeCollection: this.themeCollection
    })
  }

  updateComponent(state: any) {
    return <RemixUiSolidityUmlGen
      updatedSvg={state.updatedSvg}
      loading={state.loading}
      themeSelected={state.currentlySelectedTheme}
      themeName={state.themeName}
      fileName={state.fileName}
      themeCollection={state.themeCollection}
    />
  }
}

