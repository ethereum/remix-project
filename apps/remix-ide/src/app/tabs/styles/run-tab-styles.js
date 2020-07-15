var csjs = require('csjs-inject')

var css = csjs`
  .runTabView {
    display: flex;
    flex-direction: column;
  }
  .runTabView::-webkit-scrollbar {
    display: none;
  }
  .settings {
    padding: 0 24px 16px;
  }
  .crow {
    display: block;
    margin-top: 8px;
  }
  .col1 {
    width: 30%;
    float: left;
    align-self: center;
  }
  .settingsLabel {
    font-size: 11px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .environment {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
  }
  .environment a {
    margin-left: 7px;
  }
  .account {
    display: flex;
    align-items: center;
  }
  .account i {
    margin-left: 12px;
  }
  .col2 {
    border-radius: 3px;
  }
  .col2_1 {
    width: 164px;
    min-width: 164px;
  }
  .col2_2 {
  }
  .select {
    font-weight: normal;
    width: 100%;
  }
  .instanceContainer {
    display: flex;
    flex-direction: column;
    margin-bottom: 2%;
    border: none;
    text-align: center;
    padding: 0 14px 16px;
  }
  .pendingTxsContainer  {
    display: flex;
    flex-direction: column;
    margin-top: 2%;
    border: none;
    text-align: center;
  }
  .container {
    padding: 0 24px 16px;
  }
  .recorderDescription {
    margin: 0 15px 15px 0;
   }
  .contractNames {
    width: 100%;
    border: 1px solid
  }
  .subcontainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
  }
  .subcontainer i {
    width: 16px;
    display: flex;
    justify-content: center;
    margin-left: 1px;
  }
  .button button{
    flex: none;
  }
  .button {
    display: flex;
    align-items: center;
    margin-top: 13px;
  }
  .transaction {
  }
  .atAddress {
    margin: 0;
    min-width: 100px;
    width: 100px;
    height: 100%;
    word-break: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
  }
  .atAddressSect {
    margin-top: 8px;
    height: 32px;
  }
  .atAddressSect input {
    height: 32px;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
  .ataddressinput {
    padding: .25rem;
  }
  .create {
  }
  .input {
    font-size: 10px !important;
  }
  .noInstancesText {
    font-style: italic;
    text-align: left;
    padding-left: 15px;
  }
  .pendingTxsText {
    font-style: italic;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-wrap: wrap;
  }
  .item {
    margin-right: 1em;
    display: flex;
    align-items: center;
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
  .disableMouseEvents {
    pointer-events: none;
  }
  .icon {
    cursor: pointer;
    font-size: 12px;
    cursor: pointer;
    margin-left: 5px;
  }
  .icon:hover {
    font-size: 12px;
    color: var(--warning);
  }
  .errorIcon {
    color: var(--warning);
    margin-left: 15px;
  }
  .failDesc {
    color: var(--warning);
    padding-left: 10px;
    display: inline;
  }
  .network {
    margin-left: 8px;
    pointer-events: none;
  }
  .networkItem {
    margin-right: 5px;
  }
  .transactionActions {
    display: flex;
    justify-content: space-evenly;
    width: 145px;
  }
  .orLabel {
    text-align: center;
    text-transform: uppercase;
  }
  .infoDeployAction {
    margin-left: 1px;
    font-size: 13px;
    color: var(--info);
  }
  .gasValueContainer {
    flex-direction: row;
    display: flex;
  }
  .gasNval {
    width: 55%;
    font-size: 0.8rem;
  }
  .gasNvalUnit {
    width: 41%;
    margin-left: 10px;
    font-size: 0.8rem;
  }
  .deployDropdown {
    text-align: center;
    text-transform: uppercase;
  }
`

module.exports = css
