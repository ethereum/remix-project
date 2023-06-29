import React from 'react' // eslint-disable-line
import { ViewPlugin } from '@remixproject/engine-web'
import { EventEmitter } from 'events'
import {RemixUiStaticAnalyser} from '@remix-ui/static-analyser' // eslint-disable-line
import * as packageJson from '../../../../../package.json'
import Registry from '../state/registry'
import { PluginViewWrapper } from '@remix-ui/helper'

var EventManager = require('../../lib/events')

const profile = {
  name: 'solidityStaticAnalysis',
  displayName: 'Solidity Analyzers',
  methods: [],
  events: [],
  icon: 'assets/img/staticAnalysis.webp',
  description: 'Checks the contract code for security vulnerabilities and bad practices.',
  kind: 'analysis',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/static_analysis.html',
  version: packageJson.version,
  maintainedBy: 'Remix'
}

class AnalysisTab extends ViewPlugin {
  constructor () {
    super(profile)
    this.event = new EventManager()
    this.events = new EventEmitter()
    this.registry = Registry.getInstance()
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'staticAnalyserView')
    this._components = {}
    this._components.registry = this.registry
    this._deps = {
      offsetToLineColumnConverter: this.registry.get(
        'offsettolinecolumnconverter').api
    }
    this.dispatch = null
    /**
     * @type {Array<{
      formattedMessage: string;
      type: "warning" | "error";
      column: number;
      line: number;
    }>}
     * @description Array of objects containing the results of Linting
     */
    this.hints = []
  }

  async onActivation () {
    this.renderComponent()
    const isSolidityActive = await this.call('manager', 'isActive', 'solidity')
    if (!isSolidityActive) {
      await this.call('manager', 'activatePlugin', 'solidity')
    }

    this.event.register('staticAnaysisWarning', (count) => {
      let payloadType = ''

      let hasError = this.hints && this.hints.some(hint => hint.type === 'error')
      if (hasError) {
        payloadType = 'error';
      } else {
        let hasWarning = this.hints.some(hint => hint.type === 'warning')
        if (hasWarning) {
          payloadType = 'warning';
        }
      }

      if (count > 0) {
        this.emit('statusChanged', { key: count, title: `${count} warning${count === 1 ? '' : 's'}`, type: payloadType })
      } else if (count === 0) {
        this.emit('statusChanged', { key: 'succeed', title: 'no warning', type: 'success' })
      } else {
        // count ==-1 no compilation result
        this.emit('statusChanged', { key: 'none' })
      }
    })
  }

  setDispatch (dispatch) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  render () {
    return <div id='staticAnalyserView'><PluginViewWrapper plugin={this} /></div>
  }

  updateComponent(state) {
    return  <RemixUiStaticAnalyser
    registry={state.registry}
    analysisModule={state.analysisModule}
    event={state.event}
  />
  }

  renderComponent () {
    this.dispatch && this.dispatch({
      registry: this.registry,
      analysisModule: this,
      event: this.event
    })
  }
}

module.exports = AnalysisTab
