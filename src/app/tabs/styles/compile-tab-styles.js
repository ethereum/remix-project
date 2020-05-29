const csjs = require('csjs-inject')

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
  .info {
    padding: 10px;
    word-break: break-word;
  }
  .contract {
    display: block;
    margin: 3% 0;
  }
  .nightlyBuilds {
    display: flex;
    flex-direction: row;
    align-items: center;
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
  .compilerConfig {
    display: flex;
    align-items: center;
  }
  .compilerConfig label {
    margin: 0;
  }
  .compilerSection {
    padding: 12px 24px 16px;
  }
  .compilerLabel {
    margin-bottom: 2px;
    font-size: 11px;
    line-height: 12px;
    text-transform: uppercase;
  }
  .copyButton {
    padding: 6px;
    font-weight: bold;
    font-size: 11px;
    line-height: 15px;
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
  .optimizeContainer {
    display: flex;
  }
  .noContractAlert {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .contractHelperButtons {
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    float: right;
  }
  .copyToClipboard {
    font-size: 1rem;
  }
  .copyIcon {
    margin-right: 5px;
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
  .errorBlobs {
    padding-left: 5px;
    padding-right: 5px;
    word-break: break-word;
  }
  .storageLogo {
    width: 20px;
    height: 20px;
  }
  .spinningIcon {
    display: inline-block;
    position: relative;
    animation: spin 2s infinite linear;
    -moz-animation: spin 2s infinite linear;
    -o-animation: spin 2s infinite linear;
    -webkit-animation: spin 2s infinite linear;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @-webkit-keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @-moz-keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @-o-keyframes spin {
     0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @-ms-keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .bouncingIcon {
    display: inline-block;
    position: relative;
    -moz-animation: bounce 2s infinite linear;
    -o-animation: bounce 2s infinite linear;
    -webkit-animation: bounce 2s infinite linear;
    animation: bounce 2s infinite linear;
  } 

  @-webkit-keyframes bounce {
      0% { top: 0; }
      50% { top: -0.2em; }
      70% { top: -0.3em; }
      100% { top: 0; }
  }
  @-moz-keyframes bounce {
      0% { top: 0; }
      50% { top: -0.2em; }
      70% { top: -0.3em; }
      100% { top: 0; }
  }
  @-o-keyframes bounce {
      0% { top: 0; }
      50% { top: -0.2em; }
      70% { top: -0.3em; }
      100% { top: 0; }
  }
  @-ms-keyframes bounce {
      0% { top: 0; }
      50% { top: -0.2em; }
      70% { top: -0.3em; }
      100% { top: 0; }
  }
  @keyframes bounce {
      0% { top: 0; }
      50% { top: -0.2em; }
      70% { top: -0.3em; }
      100% { top: 0; }
  }
`

module.exports = css
