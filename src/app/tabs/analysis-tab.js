var yo = require('yo-yo')
var csjs = require('csjs-inject')
var StaticAnalysis = require('../staticanalysis/staticAnalysisView')

var globalRegistry = require('../../global/registry')
var EventManager = require('../../lib/events')

module.exports = class AnalysisTab {
  constructor (localRegistry) {
    const self = this
    self.event = new EventManager()
    self._view = { el: null }
    self.data = {}
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._deps = {}
  }
  profile () {
    return {
      name: 'SolidityAnalysis',
      methods: [],
      events: [],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxjaXJjbGUgY3g9IjIiIGN5PSIyNSIgcj0iMiIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTkiIHI9IjIiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjExIiByPSIyIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSIxNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjQ4IiBjeT0iNSIgcj0iMiIvPjxjaXJjbGUgY3g9IjIiIGN5PSIzOSIgcj0iMiIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iNDEiIHI9IjIiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjMzIiByPSIyIi8+PGNpcmNsZSBjeD0iMzUiIGN5PSI0MyIgcj0iMiIvPjxjaXJjbGUgY3g9IjQ4IiBjeT0iMzEiIHI9IjIiLz48cG9seWxpbmUgZmlsbD0ibm9uZSIgcG9pbnRzPSIyLDI1IDE1LDE5IDI1LDExICAgMzUsMTcgNDgsNSAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwb2x5bGluZSBmaWxsPSJub25lIiBwb2ludHM9IjIsMzkgMTUsNDEgMjUsMzMgICAzNSw0MyA0OCwzMSAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=='
    }
  } 
  render () {
    const self = this
    var staticanalysis = new StaticAnalysis()
    staticanalysis.event.register('staticAnaysisWarning', (count) => {
      if (count > 0) {
        const msg = `Static Analysis raised ${count} warning(s) that requires your attention. Check Solidity Static Analysis Module for more information.`
        const settings = { type: 'staticAnalysisWarning', useSpan: true }
        self.event.trigger('newStaticAnaysisWarningMessage', [msg, settings])
      }
    })
    self._components.registry.put({api: staticanalysis, name: 'staticanalysis'})
    if (self._view.el) return self._view.el
    self._view.el = yo`
      <div class="${css.analysisTabView} "id="staticanalysisView">${staticanalysis.render()}</div>`

    return self._view.el
  }
}
const css = csjs`
  .analysisTabView {
    padding: 2%;
    padding-bottom: 3em;
    display: flex;
    flex-direction: column;
  }
`
