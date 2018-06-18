var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .testTabView {}
  .infoBox  {
    ${styles.rightPanel.testTab.box_listTests};
    margin: 2%;
  }
  .tests {}
  .testList {
    ${styles.rightPanel.testTab.box_listTests};
    line-height: 2em;
    display: flex;
    flex-direction: column;
    margin: 2%;
  }
  .testsOutput {
    ${styles.rightPanel.testTab.box_listTests};
    margin: 2%;
  }
  .buttons {
    ${styles.rightPanel.testTab.box_listTests};
    margin: 2%;
  }
  .runButton {
    ${styles.rightPanel.testTab.button_runTests};
  }
`

module.exports = css
