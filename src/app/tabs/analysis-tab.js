var yo = require('yo-yo')

function analysisTab (container, appAPI, events, opts) {
  var el = yo`
    <div class="${css.analysisTabView} "id="staticanalysisView">
    </div>
  `
  container.appendChild(el)
  return el
}

module.exports = analysisTab
