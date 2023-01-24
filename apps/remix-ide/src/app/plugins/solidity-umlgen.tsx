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
const parser = (window as any).SolidityParser

const profile = {
    name: 'solidityumlgen',
    displayName: 'Solidity UML Generator',
    description: 'Generate UML diagram in svg format from last compiled contract',
    location: 'mainPanel',
    methods: ['showUmlDiagram', 'generateUml'],
    events: [],
}

export class SolidityUmlGen extends ViewPlugin implements ISolidityUmlGen {
  element: HTMLDivElement
  currentFile: string
  svgPayload: string
  updatedSvg: string
  amIActivated: boolean
  appManager: RemixAppManager
  dispatch: React.Dispatch<any> = () => {}
  constructor(appManager: RemixAppManager) {
    super(profile)
    this.currentFile = ''
    this.svgPayload = ''
    this.updatedSvg = ''
    this.appManager = appManager
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'sol-uml-gen')
  }

  onActivation(): void {
      this.amIActivated = true
  }

  onDeactivation(): void {
      this.amIActivated = false
  }

  generateUml(currentFile: string) {
    this.call('solidity', 'compile', currentFile)
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data, input, version) => {
      let result = ''  
      if (data.sources && Object.keys(data.sources).length > 1) { // we should flatten first as there are multiple asts
          result = await this.flattenContract(source, currentFile, data)
        }
        const ast = result.length > 1 ? parser.parse(result) : parser.parse(source.sources[currentFile].content)
        const payload = vizRenderStringSync(convertUmlClasses2Dot(convertAST2UmlClasses(ast, currentFile)))
        const fileName = `${currentFile.split('/')[0]}/resources/${currentFile.split('/')[1].split('.')[0]}.svg`
        await this.call('fileManager', 'writeFile', fileName, payload)
        this.updatedSvg = payload //test
        console.log({ payload })
        this.renderComponent()
        // await this.showUmlDiagram(fileName, payload)
      })
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

  async showUmlDiagram(path: string, svgPayload: string) {
    if (!this.amIActivated) return
    if((!path && path.length < 1) || (svgPayload.length < 1 || !svgPayload.startsWith('<?xml'))) {
      await this.call('notification', 'alert', {
        id: 'solidityumlgenAlert',
        message: 'Both file path and svg payload are required!'
      })
      return
    } else {
      this.currentFile = path
      this.updatedSvg = svgPayload
    }
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
    this.dispatch({...this, updatedSvg: this.updatedSvg })
  }

  updateComponent(state: any) {
    return <div id="sol-uml-gen"><RemixUiSolidityUmlGen plugin={state} updatedSvg={state.updatedSvg} /></div>
  }
}

