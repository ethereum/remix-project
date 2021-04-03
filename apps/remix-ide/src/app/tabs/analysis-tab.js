import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { ViewPlugin } from '@remixproject/engine-web'
import { EventEmitter } from 'events'
import * as packageJson from '../../../../../package.json'
// import SourceHighlighter from '../editor/SourceHighlighters'
import { RefactorRemixAnalyser } from '@remix-ui/static-analyser' // eslint-disable-line

const profile = {
  name: 'solidityStaticAnalysis',
  displayName: 'Solidity static analysis',
  methods: [],
  events: [],
  icon: 'assets/img/staticAnalysis.webp',
  description:
    'Checks the contract code for security vulnerabilities and bad practices.',
  kind: 'analysis',
  location: 'sidePanel',
  documentation:
    'https://remix-ide.readthedocs.io/en/latest/static_analysis.html',
  version: packageJson.version
}

class AnalysisTab extends ViewPlugin {
  constructor (registry) {
    super(profile)
    this.events = new EventEmitter()
    this.registry = registry
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'staticAnalyserView')
    // this.lastCompilationResult = null
    // this.lastCompilationSource = null
    // this.isPluginActivated = false
    // this.renderComponent()
  }

  onActivation () {
    this.renderComponent()
  }

  render () {
    return this.element
    // this.registry.put({ api: this.staticanalysis, name: 'staticanalysis' })
  }

  renderComponent () {
    ReactDOM.render(
      <RefactorRemixAnalyser
        analysisRunner={this.runner}
        registry={this.registry}
        staticanalysis={this.staticanalysis}
        // lastCompilationResult={this.lastCompilationResult}
        // lastCompilationSource={this.lastCompilationSource}
        analysisModule={this}
      />,
      this.element
    )
  }

  listenOnCompilationFinished () {
    this.on(
      'solidity',
      'compilationFinished',
      (file, source, languageVersion, data) => {
        console.log('file: ', file, 'source: ', source, languageVersion, data)
        // self.lastCompilationResult = null
        // self.lastCompilationSource = null
        // if (languageVersion.indexOf('soljson') !== 0) return
        // self.lastCompilationResult = data
        // self.lastCompilationSource = source
        // self.currentFile = file
        // self.correctRunBtnDisabled()
        // if (
        //   self.view &&
        //   self.view.querySelector('#autorunstaticanalysis').checked
        // ) {
        //   self.run()
        // }
      }
    )
  }
}

module.exports = AnalysisTab
