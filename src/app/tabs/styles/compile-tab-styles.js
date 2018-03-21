var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .compileTabView {
    padding: 2%;
  }
  .contract {
    display: block;
    margin: 3% 0;
  }
  .compileContainer  {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    margin-bottom: 2%;
  }
  .autocompileContainer {
    width: 90px;
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
    color: ${styles.rightPanel.compileTab.icon_WarnCompilation_Color};
    margin-left: 1%;
  }
  .compileButtons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .name {
    display: flex;
  }
  .size {
    display: flex;
  }
  .compileButton {
    ${styles.rightPanel.compileTab.button_Compile};
    width: 120px;
    min-width: 110px;
    margin-right: 1%;
    font-size: 12px;
  }
  .container {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    margin: 0;
    display: flex;
    align-items: center;
  }
  .contractNames {
    ${styles.rightPanel.compileTab.dropdown_CompileContract};
    margin-right: 5%;
  }
  .contractButtons {
    display: flex;
    cursor: pointer;
    justify-content: center;
    text-align: center;
  }
  .details {
    ${styles.rightPanel.compileTab.button_Details};
  }
  .publish {
    ${styles.rightPanel.compileTab.button_Publish};
    margin-left: 2%;
    width: 120px;
  }
  .log {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    display: flex;
    flex-direction: column;
    margin-bottom: 5%;
    overflow: visible;
  }
  .key {
    margin-right: 5px;
    color: ${styles.rightPanel.text_Primary};
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
    color: ${styles.rightPanel.icon_Color_TogglePanel};
  }
  .questionMark:hover {
    color: ${styles.rightPanel.icon_HoverColor_TogglePanel};
  }
  .detailsJSON {
    padding: 8px 0;
    background-color: ${styles.rightPanel.modalDialog_BackgroundColor_Primary};
    border: none;
    color: ${styles.rightPanel.modalDialog_text_Secondary};
  }
  .icon {
    margin-right: 3%;
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
    color: ${styles.colors.transparent};
  }
  70% {
    margin-bottom: 0;
    color: ${styles.rightPanel.text_Secondary};
  }
  100% {
    margin-bottom: 0;
    color: ${styles.colors.transparent};
  }
}
`

module.exports = css
