var csjs = require('csjs-inject')

var css = csjs`
  .settingsTabView {
    padding: 2%;
    display: flex;
  }
  .info {
    margin-bottom: 1em;
    word-break: break-word;
  }
  .title {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 1em;
  }
  .crow {
    display: flex;
    overflow: auto;
    clear: both;
    padding: .2em;
  }
  .checkboxText {
    font-weight: normal;
  }
  .crow label {
    cursor:pointer;
  }
  .crowNoFlex {
    overflow: auto;
    clear: both;
  }
  .attention {
    margin-bottom: 1em;
    padding: .5em;
    font-weight: bold;
  }
  .select {
    font-weight: bold;
    margin-top: 1em;
  }
  .heading {
    margin-bottom: 0;
  }
  .explaination {
    margin-top: 3px;
    margin-bottom: 3px;
  }
  input {
    margin-right: 5px;
    cursor: pointer;
  }
  input[type=radio] {
    margin-top: 2px;
  }
  .pluginTextArea {
    font-family: unset;
  }
  .pluginLoad {
    vertical-align: top;
  }
  i.warnIt {
    color: var(--warning);
  }
  .icon {
    margin-right: .5em;
  }
  .remixdinstallation {
    padding: 3px;
    border-radius: 2px;
    margin-left: 5px;
  }
  .savegisttoken {
    margin-left: 5px;
  }
}
`

module.exports = css
