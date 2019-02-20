const csjs = require('csjs-inject')
// const styleGuide = require('../../ui/styles-guide/theme-chooser')
// const styles = styleGuide.chooser()

const css = csjs`
  .title {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 1em;
  }
  .panicError {
    color: red;
    font-size: 20px;
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
  .select {
    font-weight: bold;
    margin: 10px 0px;
  }
  .info {

    word-break: break-word;
  }
  .compileTabView {
    padding: 2%;
  }
  .contract {
    display: block;
    margin: 3% 0;
  }
  .compileContainer  {
    margin-bottom: 2%;
  }
  .autocompileContainer {
    display: flex;
    align-items: center;
  }
  .hideWarningsContainer {
    display: flex;
    align-items: center;
  }
  .autocompile {}
  .autocompileTitle {
    font-weight: bold;
    margin: 1% 0;
  }
  .autocompileText {
    margin: 1% 0;
    font-size: 12px;
    overflow: hidden;
    word-break: normal;
    line-height: initial;
  }
  .warnCompilationSlow {
    margin-left: 1%;
  }
  .compileButtons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .name {
    display: flex;
  }
  .size {
    display: flex;
  }
  .checkboxes {
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .compileButton {
    width: 100%;
    margin: 15px 0 10px 0;
    font-size: 12px;
  }
  .container {
    margin: 0;
    margin-bottom: 2%;
  }
  .contractContainer {
    display: flex;
    align-items: center;
    margin-bottom: 2%;
  }
  .optimizeContainer {
    display: flex;
  }
  .contractNames {
    width:78%;
  }
  .contractHelperButtons {
    display: flex;
    cursor: pointer;
    text-align: center;
    justify-content: flex-end;
    margin: 15px 15px 10px 0;
  }
  .copyButton {
    padding: 0 7px;
    min-width: 50px;
    width: auto;
    margin-left: 5px;
    background-color: inherit;
    border: inherit;
  }
  .bytecodeButton {
    min-width: 80px;
  }
  .copyIcon {
    margin-right: 5px;
  }
  .details {
    min-width: 70px;
    width: 80px;
  }
  .publish {
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;
  }
  .log {
    display: flex;
    flex-direction: column;
    margin-bottom: 5%;
    overflow: visible;
  }
  .key {
    margin-right: 5px;
    text-transform: uppercase;
    width: 100%;
  }
  .value {
    display: flex;
    width: 100%;
    margin-top: 1.5%;
  }
  .questionMark {
    margin-left: 2%;
    cursor: pointer;
  }
  .questionMark:hover {
  }
  .detailsJSON {
    padding: 8px 0;
    border: none;
  }
  .icon {
    margin-right: 0.3em;
  }
  .spinningIcon {
    margin-right: .3em;
    animation: spin 2s linear infinite;
  }
  .bouncingIcon {
    margin-right: .3em;
    animation: bounce 2s infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @-webkit-keyframes bounce {
    0% {
      margin-bottom: 0;
    }
    70% {
      margin-bottom: 0;
    }
    100% {
      margin-bottom: 0;
    }
  }
`

module.exports = css
