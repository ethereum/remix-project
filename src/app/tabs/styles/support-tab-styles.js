const csjs = require('csjs-inject')

const css = csjs`
  .supportTabView {
    height: 100%;
    padding: 2%;
    padding-bottom: 3em;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: auto;
  }
  .chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 85%;
    padding: 0;
  }
  .chatTitle {
    height: 40px;
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
  }
  .chatTitle:hover {
    cursor: pointer;
  }
  .icon {
    height: 70%;
    margin-right: 2%;
  }
  .chatTitleText {
    font-size: 17px;
    font-weight: bold;
  }
  .chatTitleText {
    opacity: 0.8;
  }
  .chatIframe {
    width: 100%;
    height: 100%;
    transform: scale(0.9);
    padding: 0;
    border: none;
  }
  .infoBox {
  }
  .remixdinstallation {
    padding: 3px;
    border-radius: 2px;
    margin-left: 5px;
  }
  .info {
    margin-top: 1em;
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
  .crow label {
    cursor:pointer;
  }
  .crowNoFlex {
    overflow: auto;
    clear: both;
  }
`

module.exports = css
