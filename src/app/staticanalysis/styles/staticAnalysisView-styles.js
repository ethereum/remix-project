var csjs = require('csjs-inject')

var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .analysis {
    display: flex;
    flex-direction: column;
  }
  .result {
    margin-top: 1%;
  }
  .buttons  {
    ${styles.rightPanel.analysisTab.box_AnalysisContainer}
    display: flex;
    align-items: center;
  }
  .buttonRun  {
    ${styles.rightPanel.analysisTab.button_Run_AnalysisTab}
    margin-right: 1%;
  }
  .analysisModulesContainer {
    ${styles.rightPanel.analysisTab.box_AnalysisContainer}
    margin-bottom: 1%;
    line-height: 2em;
    display: flex;
    flex-direction: column;
  }
  .label {
    display: flex;
    align-items: center;
  }
`

module.exports = css
