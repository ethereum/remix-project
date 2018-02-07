var yo = require('yo-yo')
var css = require('./styles/analysis-tab-styles')

function analysisTab (container) {
  var el = yo`
    <div class="${css.analysisTabView} "id="staticanalysisView">
    </div>
  `
  container.appendChild(el)
  return el
}

module.exports = analysisTab
