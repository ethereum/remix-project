var yo = require('yo-yo')
var StaticAnalysis = require('../staticanalysis/staticAnalysisView')
var EventManager = require('../../lib/events')
var css = require('./styles/analysis-tab-styles')

class AnalysisTab {

  constructor (registry) {
    this.event = new EventManager()
    this.registry = registry
  }

  render () {
    var staticanalysis = new StaticAnalysis()
    this.registry.put({api: staticanalysis, name: 'staticanalysis'})

    if (this.el) return this.el
    this.el = yo`<div class="${css.analysisTabView} "id="staticanalysisView">${staticanalysis.render()}</div>`
    return this.el
  }
}

module.exports = AnalysisTab
