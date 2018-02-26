var yo = require('yo-yo')
var css = require('./styles/analysis-tab-styles')

function analysisTab (api = {}, events = {}, opts = {}) {
  var el = yo`
    <div class="${css.analysisTabView} "id="staticanalysisView">
    </div>
  `
  return { render () { return el } }
}

module.exports = analysisTab
