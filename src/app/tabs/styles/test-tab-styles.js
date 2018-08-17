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
  .container {
    ${styles.rightPanel.testTab.box_listTests};
    margin: 2%;
    padding-bottom: 5%;
  }
  .outputTitle {
    font-weight: bold;
    margin: 10px 0;
  }
  .summaryTitle {
    font-weight: bold;
  }
  .testPass {
    background-color: ${styles.rightPanel.testTab.color_testPass};
  }
  .testLog {
    margin-bottom: 1%;
    border-radius: 4px;
    padding: 1% 1% 1% 5%;
  }
  .testFailure {
    background-color: ${styles.rightPanel.testTab.color_testFail};
  }
  .testFailureSummary {
    color: ${styles.appProperties.errorText_Color};
  }
  .buttons {
    ${styles.rightPanel.testTab.box_listTests};
    margin: 2%;
  }
  .runButton {
    ${styles.rightPanel.testTab.button_runTests};
  }
  .generateTestFile {
    ${styles.rightPanel.testTab.button_generateTestFile};
    min-width: 100px
  }
  .title {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 1em;
  }
`

module.exports = css
