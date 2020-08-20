var csjs = require('csjs-inject')

const css = csjs`
  .settingsTabView {
    padding: 2%;
  }
  .info {
    word-break: break-word;
    font-size: .8rem;
  }
  .info h7 {
    margin-bottom: .5rem;
  }
  .frow {
    margin-bottom: .5rem;
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
  .heading {
    margin-bottom: 0;
  }
  .explaination {
    margin-top: 3px;
    margin-bottom: 3px;
  }
  input {
    width: inherit;
  }
  input[type=radio] {
    margin-top: 2px;
  }
  .pluginTextArea {
    font-family: unset;
  }

  .removePlugin {
    cursor: pointer;
  }
  .icon {
    margin-right: .5em;
  }
  .aPlugin {
    display: inline-block;
    padding-left: 10px;
    padding-top: 4px;
    padding-bottom: 6px;
    max-width: 100px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    vertical-align: middle;
  }
  .removePlugin{
    padding-left: 7px;
    padding-right: 7px;
    margin-left: 10px;
  }
  .inline {
    display: inline;
    width: 32%;
  }
  .text, .text:hover {
    text-decoration: none;
  }
`

module.exports = css
