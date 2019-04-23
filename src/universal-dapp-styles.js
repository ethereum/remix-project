var csjs = require('csjs-inject')

var css = csjs`
  .instanceTitleContainer {
    display: flex;
    align-items: center;
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    /* height: 30px; */
    /* width: 97%; */
    overflow: hidden;
    word-break: break-word;
    line-height: initial;
    overflow: visible;
    margin-bottom: 0px;
    padding-left: 0px;
    padding-right: 10px;
  }
  .noInstancesText {

  }
  .titleLine {
    display: flex;
    align-items: baseline;
  }
  .titleText {
    /* margin-right: 1em; */
    word-break: break-word;
    min-width: 170px;
    width: 100%;
  }
  .spanTitleText {
    /* font-size: .8rem; */
    font-size: 11px;
    width:100%;
  }
  .inputGroupText {
    width: 100%;
  }
  .title .copy {
    color: var(--primary);
  }
  .titleExpander {
    /* margin-right: 10px; */
    padding: 5px 7px;
  }
  .nameNbuts {
    flex-wrap: nowrap;
    width: 100%;
  }
  .instance {
    display: block;
    /* display: flex; */
    flex-direction: column;
    /* padding: 5px 0 0 10px; */
    margin-bottom: 10px;
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
    margin-right: 5px;
    cursor: pointer;
    font-size: 16px;
    padding-top: 5px;
    vertical-align: top;
  }
  .cActionsWrapper {
    padding: 0px 0 10px 10px;
    border: 1px solid rgba(0,0,0,0.125);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0.25rem;
    border-top-rightt-radius: 0;
    border-bottom-right-radius: 0.25rem;
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
  .contractActions {
  }
  .instanceButton {
    border-radius: 3px;
  }
  .closeIcon {
    font-size: 12px;
    cursor: pointer;
    margin-left: 5px;
  }
  .udapp {}
  .udappClose {
    display: flex;
    justify-content: flex-end;
  }
  .contractProperty {
    overflow: auto;
    margin-bottom: 0.4em;
    margin-top: 1em;
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
    /* background-color: var(--warning); */
    min-width: 100px;
    width: 100px;
    /* font-size: 10px; */
    margin:0;
    word-break: inherit;
  }
  .contractProperty button:disabled {
    cursor: not-allowed;
    background-color: white;
    border-color: lightgray;
  }
  .contractProperty.constant button {
    /* background-color:var(--info); */
    min-width: 100px;
    width: 100px;
    margin:0;
    word-break: inherit;
    outline: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .contractProperty input {
    /* width: 75% */
  }
  .contractProperty > .value {
    box-sizing: border-box;
    float: left;
    align-self: center;
    margin-left: 4px;
  }
  .value ul {
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--info);
  }
  .contractActionsContainer {
    width: 98%;
  }
  .contractActionsContainerSingle {
    display: flex;
    width: 100%;
  }
  .contractActionsContainerMulti {
    display:none;
    width: 100%;
  }
  .contractActionsContainerMultiInner {
    margin-bottom: 10px;
    padding: 0px 5px 5px 5px;
    background-color: var(--light);
    width: 99%;
    border-radius: 3px;
  }
  .multiHeader {
    text-align: left;
    font-size: 10px;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .contractActionsContainerMultiInner .multiTitle {
    padding-left: 10px;
  }
  .contractProperty .multiTitle {
    display: inline-block;
    width: 90%;
    font-size: 12px;
    height: 25px;
    padding-left: 20px;
    font-weight: bold;
    line-height: 25px;
    cursor: default;
    padding-top: 5px;
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
    margin-bottom: 8px;
    /* display: flex; */
    clear:both;
  }
  .multiArg input{
    padding: 5px;
  }

  .multiArg label {
      float: left;
      margin-right: 6px;
      font-size: 10px;
      width: 30%;
      padding-top: 5px;
      word-break: break-all;
  }
  .multiArg button {
    border-radius: 3px;
    float: right;
    margin-right: 2%;
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
    border: 1px solid #dddddd;
    padding: .36em;
    border-left: none;
    padding: 8px 8px 8px 10px;
    font-size: 10px;
    /* height: 25px; */
  }
  .hasArgs button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hasArgs .contractActionsContainerMulti button {
    border-radius: 3px;
  }
  .contractActionsContainerMultiInner .multiArg i {
    padding-right: 15px;
    padding-top: 5px;
    float: right;
  },
  .hideWarningsContainer {
    display: flex;
    align-items: center;
    margin-left: 2%
  }
`

module.exports = css
