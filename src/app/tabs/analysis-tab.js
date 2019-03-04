var yo = require('yo-yo')
var StaticAnalysis = require('../staticanalysis/staticAnalysisView')
var EventManager = require('../../lib/events')
var css = require('./styles/analysis-tab-styles')

class AnalysisTab {

  constructor (registry) {
    this.event = new EventManager()
    this.registry = registry
  }
  profile () {
    return {
      name: 'solidityStaticAnalysis',
      displayName: 'solidity static analysis',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMjA0OCIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMjA0OCAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMDQ4IDE1MzZ2MTI4aC0yMDQ4di0xNTM2aDEyOHYxNDA4aDE5MjB6bS0xMjgtMTI0OHY0MzVxMCAyMS0xOS41IDI5LjV0LTM1LjUtNy41bC0xMjEtMTIxLTYzMyA2MzNxLTEwIDEwLTIzIDEwdC0yMy0xMGwtMjMzLTIzMy00MTYgNDE2LTE5Mi0xOTIgNTg1LTU4NXExMC0xMCAyMy0xMHQyMyAxMGwyMzMgMjMzIDQ2NC00NjQtMTIxLTEyMXEtMTYtMTYtNy41LTM1LjV0MjkuNS0xOS41aDQzNXExNCAwIDIzIDl0OSAyM3oiLz48L3N2Zz4=',
      description: ' - ',
      kind: 'analysis'
    }
  }
  render () {
    var staticanalysis = new StaticAnalysis()
    this.registry.put({api: staticanalysis, name: 'staticanalysis'})

    if (this.el) return this.el
    this.el = yo`<div class="${css.analysisTabView}" id="staticanalysisView">${staticanalysis.render()}</div>`
    return this.el
  }
}

module.exports = AnalysisTab
