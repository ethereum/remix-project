import { ViewPlugin } from '@remixproject/engine-web'
import { EventEmitter } from 'events'
import * as packageJson from '../../../../../package.json'

var yo = require('yo-yo')
var StaticAnalysis = require('./staticanalysis/staticAnalysisView')
var EventManager = require('../../lib/events')

const profile = {
  name: 'solidityStaticAnalysis',
  displayName: 'Solidity static analysis',
  methods: [],
  events: [],
  icon: 'assets/img/staticAnalysis.webp',
  description: 'Checks the contract code for security vulnerabilities and bad practices.',
  kind: 'analysis',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/static_analysis.html',
  version: packageJson.version
}

class AnalysisTab extends ViewPlugin {
  constructor (registry) {
    super(profile)
    this.event = new EventManager()
    this.events = new EventEmitter()
    this.registry = registry
  }

  render () {
    const listOfPlugins = localStorage.getItem('workspace')
    // Reset state if plugin is deactivated
    if (!listOfPlugins.includes('solidityStaticAnalysis')) this.staticanalysis = null
    if (!this.staticanalysis) this.staticanalysis = new StaticAnalysis(this.registry, this)
    this.staticanalysis.event.register('staticAnaysisWarning', (count) => {
      if (count > 0) {
        this.emit('statusChanged', { key: count, title: `${count} warning${count === 1 ? '' : 's'}`, type: 'warning' })
      } else if (count === 0) {
        this.emit('statusChanged', { key: 'succeed', title: 'no warning', type: 'success' })
      } else {
        // count ==-1 no compilation result
        this.emit('statusChanged', { key: 'none' })
      }
    })
    this.registry.put({ api: this.staticanalysis, name: 'staticanalysis' })

    return yo`<div class="px-3 pb-1" id="staticanalysisView">${this.staticanalysis.render()}</div>`
  }
}

module.exports = AnalysisTab
