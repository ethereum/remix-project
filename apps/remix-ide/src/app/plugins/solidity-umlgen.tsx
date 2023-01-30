/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RemixUiSolidityUmlGen } from '@remix-ui/solidity-uml-gen' 
import { ISolidityUmlGen } from 'libs/remix-ui/solidity-uml-gen/src/types'
import { RemixAppManager } from 'libs/remix-ui/plugin-manager/src/types'
import { concatSourceFiles, getDependencyGraph } from 'libs/remix-ui/solidity-compiler/src/lib/logic/flattenerUtilities'
import { convertUmlClasses2Dot } from 'sol2uml/lib/converterClasses2Dot'
import { convertAST2UmlClasses } from 'sol2uml/lib/converterAST2Classes'
import vizRenderStringSync from '@aduh95/viz.js/sync'
import { PluginViewWrapper } from '@remix-ui/helper'
import { customAction } from '@remixproject/plugin-api'
const parser = (window as any).SolidityParser

const profile = {
    name: 'solidityumlgen',
    displayName: 'Solidity UML Generator',
    description: 'Generate UML diagram in svg format from last compiled contract',
    location: 'mainPanel',
    methods: ['showUmlDiagram', 'generateUml', 'generateCustomAction'],
    events: [],
}

export class SolidityUmlGen extends ViewPlugin implements ISolidityUmlGen {
  element: HTMLDivElement
  currentFile: string
  svgPayload: string
  updatedSvg: string
  currentlySelectedTheme: string
  loading: boolean

  appManager: RemixAppManager
  dispatch: React.Dispatch<any> = () => {}
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.currentFile = ''
    this.svgPayload = ''
    this.updatedSvg = ''
    this.loading = false
    this.currentlySelectedTheme = 'dark'
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'sol-uml-gen')
  }

  onActivation(): void {
    if (this.currentFile.length < 1) 
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data, input, version) => {
      let result = ''
      try {
        if (data.sources && Object.keys(data.sources).length > 1) { // we should flatten first as there are multiple asts
          result = await this.flattenContract(source, this.currentFile, data)
        }
        const ast = result.length > 1 ? parser.parse(result) : parser.parse(source.sources[this.currentFile].content)
        const umlClasses = convertAST2UmlClasses(ast, this.currentFile)
        const umlDot = convertUmlClasses2Dot(umlClasses)
        const payload = vizRenderStringSync(umlDot)
        // const splitArtifact = payload.split('<!-- Title: UmlClassDiagram Pages: 1 -->\n')
        // const modified = splitArtifact[1].replace(/<svg/g, '<svg style="background-color: pink;" ')
        // splitArtifact[1] = modified
        // const newsvg = splitArtifact[0].concat(splitArtifact[1])
        // console.log({ newsvg })
        console.log({ umlClasses, umlDot, payload })
        this.call('fileManager', 'writeFile', `${this.currentFile}.svg`, payload)
        this.updatedSvg = payload
        this.renderComponent()
      } catch (error) {
        console.log({ error })
      }
    })
    this.on('theme', 'themeChanged', (theme) => {
      console.log('theme changed', {theme})
      this.currentlySelectedTheme = theme.quality
      this.renderComponent()
    })
  }

  async mangleSvgPayload(svgPayload: string) : Promise<string> {
    const parser = new DOMParser()
    const themeQuality = await this.call('theme', 'currentTheme')
    const parsedDocument = parser.parseFromString(svgPayload, 'image/svg+xml')
    // const svgElement = parsedDocument.getElementsByTagName('polygon')[0]
    // svgElement.style.filter = themeQuality.quality === 'dark' ? 'invert(1)' : 'invert(0)'
    const res = parsedDocument.documentElement
    parsedDocument.bgColor = '#cccabc'
    res.style.filter = themeQuality.quality === 'dark' ? 'invert(1)' : 'invert(0)'
    const stringifiedSvg = new XMLSerializer().serializeToString(parsedDocument)
    // themeQuality.quality === 'dark' ? svgElement.style.background = '#cccabc' : 'invert(0)'
    console.log({ parsedDocument, themeQuality, stringifiedSvg })
    return stringifiedSvg
  }

  onDeactivation(): void {
    this.off('solidity', 'compilationFinished')
  }

  generateCustomAction = async (action: customAction) => {
    this.currentFile = action.path[0]
    this.generateUml(action.path[0])
  }

  generateUml(currentFile: string) {
    this.call('solidity', 'compile', currentFile)
    this.call('tabs', 'focus', 'solidityumlgen')
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
    const ast = data.sources
    const dependencyGraph = getDependencyGraph(ast, filePath)
    const sorted = dependencyGraph.isEmpty()
        ? [filePath]
        : dependencyGraph.sort().reverse()
    const sources = source.sources
    const result = concatSourceFiles(sorted, sources)
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
      themeSelected: this.currentlySelectedTheme
    })
  }

  updateComponent(state: any) {
    return <RemixUiSolidityUmlGen plugin={state} updatedSvg={state.updatedSvg} loading={state.loading} />
  }
}

