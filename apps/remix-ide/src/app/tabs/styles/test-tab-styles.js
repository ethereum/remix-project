var csjs = require('csjs-inject')

var css = csjs`
  .testTabView {}
  .infoBox  {
    margin: 5%;
  }
  .tests {}
  .testList {
    line-height: 2em;
    display: flex;
    flex-direction: column;
    margin: 5%;
    max-height: 300px;
    overflow-y: auto;

  }
  .container {
    margin: 2%;
    padding-bottom: 5%;
    max-height: 300px;
    overflow-y: auto;
  }
  .summaryTitle {
    font-weight: bold;
  }
  .testPass {
  }
  .testLog {
    margin-bottom: 1%;
    border-radius: 4px;
    padding: 1% 1% 1% 5%;
  }
  .testFailureSummary {
  }
  .title {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 1em;
  }
  .label {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
  .labelOnBtn {
    border: hidden;
  }
  .inputFolder {
    width: 80%;
  }
`
module.exports = css
