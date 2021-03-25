import React from 'react'
import ReactDOM from 'react-dom'
import { ViewPlugin } from '@remixproject/engine-web'

import { EventEmitter } from 'events'
import RemixUiStaticAnalyser from '../../../../../libs/remix-ui/static-analyser/src/lib/static-analyser'
import * as packageJson from '../../../../../package.json'

var yo = require('yo-yo')
var StaticAnalysis = require('./staticanalysis/staticAnalysisView')
var EventManager = require('../../lib/events')

const StaticAnalysisRunner = require('@remix-project/remix-analyzer')
  .CodeAnalysis

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
  constructor(registry) {
    super(profile)
    this.event = new EventManager()
    this.events = new EventEmitter()
    this.runner = new StaticAnalysisRunner()
    this.registry = registry
    this.element = document.createElement('div')
    this.element.setAttribute('id', 'staticAnalyserView')
    this.renderComponent()
  }

  render() {
    this.staticanalysis = new StaticAnalysis(this.registry, this)
    this.staticanalysis.event.register('staticAnaysisWarning', count => {
      if (count > 0) {
        this.emit('statusChanged', {
          key: count,
          title: `${count} warning${count === 1 ? '' : 's'}`,
          type: 'warning'
        })
      } else if (count === 0) {
        this.emit('statusChanged', {
          key: 'succeed',
          title: 'no warning',
          type: 'success'
        })
      } else {
        // count ==-1 no compilation result
        this.emit('statusChanged', { key: 'none' })
      }
    })
    this.registry.put({ api: this.staticanalysis, name: 'staticanalysis' })

    // return ReactDOM.render(<RemixUiStaticAnalyser />, this.element)
    return this.element //yo`<div class="px-3 pb-1" id="staticanalysisView">${this.staticanalysis.render()}</div>`
  }

  renderComponent() {
    ReactDOM.render(
      <RemixUiStaticAnalyser
        analysisRunner={this.runner}
        renderStaticAnalysis={this.renderStaticAnalysis.bind(this)}
        event={this.event}
        events={this.events}
        registry={this.registry}
        staticanalysis={this.staticanalysis}
      />,
      this.element
    )
  }

  renderStaticAnalysis() {
    this.staticanalysis.render()
  }
}

module.exports = AnalysisTab
