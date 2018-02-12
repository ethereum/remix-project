var csjs = require('csjs-inject')
var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .runTabView {
    padding: 2%;
    display: flex;
    flex-direction: column;
  }
  .settings {
    ${styles.rightPanel.runTab.box_RunTab}
    margin-bottom: 2%;
    padding: 10px 15px 15px 15px;
  }
  .crow {
    margin-top: .5em;
    display: flex;
    align-items: center;
  }
  .col1 {
    width: 30%;
    float: left;
    align-self: center;
  }
  .col1_1 {
    font-size: 12px;
    width: 25%;
    min-width: 75px;
    float: left;
    align-self: center;
  }
  .environment {
    display: flex;
    align-items: center;
    position: relative;
  }
  .col2 {
    ${styles.rightPanel.runTab.input_RunTab}
  }
  .col2_1 {
    ${styles.rightPanel.runTab.input_RunTab}
    width: 165px;
    min-width: 165px;
  }
  .col2_2 {
    ${styles.rightPanel.runTab.dropdown_RunTab}
    width: 82px;
    min-width: 82px;
  }
  .select {
    ${styles.rightPanel.runTab.dropdown_RunTab}
    font-weight: normal;
    min-width: 150px;
  }
  .instanceContainer {
    display: flex;
    flex-direction: column;
    margin-top: 2%;
    border: none;
    text-align: center;
  }
  .pendingTxsContainer  {
    ${styles.rightPanel.runTab.box_Instance}
    display: flex;
    flex-direction: column;
    margin-top: 2%;
    border: none;
    text-align: center;
  }
  .container {
    ${styles.rightPanel.runTab.box_RunTab}
    margin-top: 2%;
  }
  .contractNames {
    ${styles.rightPanel.runTab.dropdown_RunTab}
    width: 100%;
    border: 1px solid
  }
  .contractNamesError {
    border: 1px solid ${styles.appProperties.errorText_Color}
  }
  .subcontainer {
    display: flex;
    flex-direction: row;
    align-items: baseline;
  }
  .button {
    display: flex;
    align-items: center;
    margin-top: 2%;
  }
  .transaction {
    ${styles.rightPanel.runTab.button_transaction}
  }
  .atAddress {
    ${styles.rightPanel.runTab.button_atAddress}
  }
  .create {
    ${styles.rightPanel.runTab.button_Create}
  }
  .input {
    ${styles.rightPanel.runTab.input_RunTab}
  }
  .noInstancesText {
    ${styles.rightPanel.runTab.box_Instance}
    font-style: italic;
  }
  .pendingTxsText {
    ${styles.rightPanel.runTab.borderBox_Instance}
    font-style: italic;
  }
  .item {
    margin-right: 1em;
    display: flex;
    align-items: center;
  }
  .transact {
    color: ${styles.colors.lightRed};
    margin-right: .3em;
  }
  .payable {
    color: ${styles.colors.red};
    margin-right: .3em;
  }
  .call {
    color: ${styles.colors.lightBlue};
    margin-right: .3em;
  }
  .pendingContainer {
    display: flex;
    align-items: baseline;
  }
  .pending {
    height: 25px;
    text-align: center;
    padding-left: 10px;
    border-radius: 3px;
    margin-left: 5px;
  }
  .icon {
    cursor: pointer;
    font-size: 12px;
    color: ${styles.rightPanel.runTab.icon_Color};
    margin-left: 5px;
  }
  .icon:hover {
    font-size: 12px;
    color: ${styles.rightPanel.runTab.icon_HoverColor};
  }
  .errorIcon {
    color: ${styles.appProperties.errorText_Color};
    margin-left: 15px;
  }
  .failDesc {
    color: ${styles.appProperties.errorText_Color};
    padding-left: 10px;
    display: inline;
  }
  .network {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: absolute;
    color: grey;
    width: 100%;
    height: 100%;
    padding-right: 28px;
    pointer-events: none;
  }
  .networkItem {
    margin-right: 5px;
  }
  .clearinstance {
    font-size: 20px;
    cursor: pointer;
    margin-right: 10px;
  }
  .transactionActions {
    float: right;
`

module.exports = css
