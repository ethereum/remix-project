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
  displayName: 'Solidity static analysis',
  methods: ['changedStatus'],
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
  }

  async onActivation () {
    this.renderComponent()
    const isSolidityActive = await this.call('manager', 'isActive', 'solidity')
    if (!isSolidityActive) {
      await this.call('manager', 'activatePlugin', 'solidity')
    }

    this.event.register('staticAnaysisWarning', (count) => {
      let payloadType = ''
      this.hints.forEach(hint => {
        if (hint.type === 'error') {
          payloadType = 'error'
        } else if (hint.type === 'warning' && payloadType !== 'error') {
          payloadType = 'warning'
        }
      })

      if (count > 0 && this.hints.length > 0) {
        const totalCount = count === this.hints.length ? count : count + this.hints.length
        this.emit('statusChanged', { key: totalCount, title: `${totalCount} warning${totalCount === 1 ? '' : 's'}`, type: payloadType })
      } else if (count === 0 && this.hints.length === 0) {
        this.emit('statusChanged', { key: 'succeed', title: 'no warning', type: 'success' })
      } else {
        // count ==-1 no compilation result
        this.emit('statusChanged', { key: 'none' })
      }
    })
  }

  /**
   * Takes payload (an Array of Objects) emitted by Solhint and raises the status changed event.
   * The payload sent has to be a result which should at a minimum have
   * type which could be error || warning.
   * @param {Array} payload
   */
  async changedStatus (payload) {
    let payloadType = `${payload.includes(p => p.type === 'error') ? 'error' : 'warning'}`
      if(payload.length > 0) {
        this.emit('statusChanged',
        { key: payload.length, title: `${payload.length} warning${payload.length === 1 ? '' : 's'} or errors`, type: payloadType})
      } else if (payload.length === 0) {
        this.emit('statusChanged', { key: 'succeed', title: 'no warning or errors', type: 'success' })
      } else {
        this.emit('statusChanged', { key: 'none' })
      }
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
