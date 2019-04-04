var csjs = require('csjs-inject')

var css = csjs`
  .analysis {
    display: flex;
    flex-direction: column;
  }
  .result {
    margin-top: 1%;
  }
  .buttons  {
    margin: 1rem 0;
  }
  .buttonsInner {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .buttonRun  {
    margin-right: 1%;
  }
  .analysisModulesContainer {
  }
  .label {
    display: flex;
    align-items: center;
  }
  .container {
    max-height: 500px;
    overflow-y: auto;
  }
`

module.exports = css
