var csjs = require('csjs-inject')

var css = csjs`
  .instanceTitleContainer {
    display: flex;
    align-items: center;
  }
  .calldataInput{
    height: 32px;
  }
  .title {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    width: 100%;
    overflow: hidden;
    word-break: break-word;
    line-height: initial;
    overflow: visible;
    padding: 0 0 8px;
    margin: 0;
    background: none;
    border: none;
  }
  .title button {
    background: none;
    border: none;
  }
  .titleLine {
    display: flex;
    align-items: baseline;
  }
  .titleText {
    word-break: break-word;
    width: 100%;
    border: none;
  }
  .spanTitleText {
    line-height: 12px;
    padding: 0;
    font-size: 11px;
    width:100%;
    border: none;
    background: none;
    text-transform: uppercase;
  }
  .inputGroupText {
    width: 100%;
  }
  .title .copy {
    color: var(--primary);
  }
  .titleExpander {
    padding: 5px 7px;
  }
  .nameNbuts {
    display: contents;
    flex-wrap: nowrap;
    width: 100%;
  }
  .instance {
    display: block;
    flex-direction: column;
    margin-bottom: 12px;
    background: none;
    border-radius: 2px;
  }
  .instance.hidesub {
    border-bottom: 1px solid;
  }
  .instance.hidesub .title {
      display: flex;
  }
  .instance.hidesub .udappClose {
      display: flex;
  }
  .instance.hidesub > * {
    display: none;
  }
  .methCaret {
    min-width: 12px;
    width: 12px;
    margin-left: 4px;
    cursor: pointer;
    font-size: 16px;
    line-height: 0.6;
    vertical-align: middle;
    padding: 0;
  }
  .cActionsWrapper {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0.25rem;
    border-top-rightt-radius: 0;
    border-bottom-right-radius: 0.25rem;
    padding: 8px 10px 7px;
  }
  .group:after {
    content: "";
    display: table;
    clear: both;
  }
  .buttonsContainer {
    margin-top: 2%;
    display: flex;
    overflow: hidden;
  }
  .instanceButton {
    height: 32px;
    border-radius: 3px;
    white-space: nowrap;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .closeIcon {
    font-size: 12px;
    cursor: pointer;
    margin-left: 5px;
  }
  .udappClose {
    display: flex;
    justify-content: flex-end;
  }
  .contractProperty {
    width:100%;
  }
  .contractProperty.hasArgs input {
    padding: .36em;
    border-radius: 5px;
  }
  .contractProperty .contractActionsContainerSingle input{
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .contractProperty button {
    min-width: 100px;
    width: 100px;
    margin:0;
    word-break: inherit;
  }
  .contractProperty button:disabled {
    cursor: not-allowed;
    background-color: white;
    border-color: lightgray;
  }
  .contractProperty.constant button {
    min-width: 100px;
    width: 100px;
    margin:0;
    word-break: inherit;
    outline: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .contractProperty > .value {
    box-sizing: border-box;
    float: left;
    align-self: center;
    margin-left: 4px;
  }
  .contractActionsContainer {
    width: 100%;
    margin-bottom: 8px;
  }
  .contractActionsContainerSingle {
    display: flex;
    width: 100%;
  }
  .contractActionsContainerSingle i {
    line-height: 2;
  }
  .contractActionsContainerMulti {
    display:none;
    width: 100%;
  }
  .contractActionsContainerMultiInner {
    width: 100%;
    padding: 16px 8px 16px 14px;
    border-radius: 3px;
    margin-bottom: 8px;
  }
  .multiHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    text-align: left;
    font-size: 10px;
    font-weight: bold;
  }
  .contractActionsContainerMultiInner .multiTitle {
    padding-left: 10px;
  }
  .contractProperty .multiTitle {
    padding: 0;
    line-height: 16px;
    display: inline-block;
    font-size: 12px;
    font-weight: bold;
    cursor: default;
  }
  .contractProperty .contractActionsContainerMultiInner .multiArg label{
    text-align: right;
  }
  .multiHeader .methCaret {
    float: right;
    margin-right: 0;
  }
  .contractProperty.constant .multiTitle {
    display: inline-block;
    width: 90%;
    /* font-size: 10px; */
    height: 25px;
    padding-left: 20px;
    font-weight: bold;
    line-height: 25px;
    cursor: default;
  }
  .multiArg {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 4px;
  }
  .multiArg input{
    padding: 5px;
  }
  .multiArg label {
    width: auto;
    padding: 0;
    margin: 0 4px 0 0;
    font-size: 10px;
    line-height: 12px;
    text-align: right;
    word-break: initial;
  }
  .multiArg button {
    max-width: 100px;
    border-radius: 3px;
    border-width: 1px;
    width: inherit;
  }
  .multiHeader button {
    display: inline-block;
    width: 94%;
  }
  .hasArgs .multiArg input {
    border-left: 1px solid #dddddd;
    width: 67%;
  }
  .hasArgs input {
    display: block;
    height: 32px;
    border: 1px solid #dddddd;
    padding: .36em;
    border-left: none;
    padding: 8px 8px 8px 10px;
    font-size: 10px !important;
  }
  .hasArgs button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
  }
  .hasArgs .contractActionsContainerMulti button {
    border-radius: 3px;
  }
  .contractActionsContainerMultiInner .multiArg i {
    padding-right: 10px;
  }
  .hideWarningsContainer {
    display: flex;
    align-items: center;
    margin-left: 2%
  }
`

module.exports = css
