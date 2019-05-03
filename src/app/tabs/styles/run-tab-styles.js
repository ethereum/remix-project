var csjs = require('csjs-inject')

var css = csjs`
  .runTabView {
    padding: 2%;
    display: flex;
    flex-direction: column;
  }
  .instanceContainerTitle {
    font-weight: bold;
    margin-bottom: 5%;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    padding-left: 15px;
  }
  .settings {
    margin-bottom: 2%;
    padding: 10px 0px 15px 15px;
  }
  .recorderCount {
    /* margin-right: 30px; */
    /* min-width: 13px; */
    /* display: flex; */
    /* justify-content: center; */
    /* align-items: center; */
    /* font-size: 10px; */
  }
  .crow {
    margin-top: .5em;
    display: flex;
    align-items: center;
    /*width: 500px;*/
  }
  .col1 {
    width: 30%;
    float: left;
    align-self: center;
  }
  .col1_1 {
    font-size: 12px;
    min-width: 75px;
    float: left;
    align-self: center;
  }
  .environment {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    padding-right: 25px;
  }
  .account {
    display: flex;
    align-items: center;
    width: 90%;
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
    padding: 10px 0px 15px 0px;
  }
  .pendingTxsContainer  {
    display: flex;
    flex-direction: column;
    margin-top: 2%;
    border: none;
    text-align: center;
  }
  .container {
    margin-bottom: 4%;
    padding-left: 15px;
  }
  .recorderCollapsedView,
  .recorderExpandedView {
    display: flex;
    flex-direction: column;
  }
  .recorderDescription {
    margin: 0 15px 15px 0;
   }
  .contractNames {
    width: 100%;
    border: 1px solid
  }
  .contractNamesError {
  }
  .subcontainer {
    display: flex;
    flex-direction: row;
    align-items: baseline;
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
    /* font-size: 10px; */
    word-break: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
  }
  .atAddressSect {
    margin-top: 6px;
  }
  .atAddressSect input {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .ataddressinput {
    padding: .25rem;
  }
  .create {
  }
  .input {
    font-size: 10px;
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
  .transact {
    color: var(--warning);
    margin-right: .3em;
  }
  .payable {
    color: var(--warning);
    margin-right: .3em;
  }
  .call {
    color: var(--info);
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
  .clearinstance {
    margin-right: 15px;
  }
  .transactionActions {
    display: flex;
    justify-content: space-evenly;
    width: 145px;
  }
  .orLabel {
    margin-left: 44px;
  }
  .infoDeployAction {
    margin-left: 5px;
    font-size: 13px;
    color: var(--info);
  }
  .gasValueContainer {
    flex-direction: row;
    display: flex;
  }
  .gasNval {
    /* transform: scale(0.7); */
    /* transform-origin: left; */
    margin-right: 10px;
    width: 100px;
    font-size: 0.8rem;
  }
  .gasNvalUnit {
    /* transform: scale(0.7); */
    /* transform-origin: left; */
    margin-right: 10px;
    font-size: 0.8rem;
  }
`

module.exports = css
