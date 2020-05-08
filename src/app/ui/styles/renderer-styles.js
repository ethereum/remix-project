var yo = require('yo-yo')

var css = yo`<style>
.sol.success,
.sol.error,
.sol.staticAnalysisWarning,
.sol.warning {
    white-space: pre-line;
    word-wrap: break-word;
    cursor: pointer;
    position: relative;
    margin: 0.5em 0 1em 0;
    border-radius: 5px;
    line-height: 20px;
    padding: 8px 15px;
}

.sol.success pre,
.sol.error pre,
.sol.staticAnalysisWarning pre,
.sol.warning pre {
    white-space: pre-line;
    overflow-y: hidden;
    background-color: transparent;
    margin: 0;
    font-size: 12px;
    border: 0 none;
    padding: 0;
    border-radius: 0;
}

.sol.success .close,
.sol.staticAnalysisWarning .close,
.sol.error .close,
.sol.warning .close {
    white-space: pre-line;
    font-weight: bold;
    position: absolute;
    color: hsl(0, 0%, 0%); /* black in style-guide.js */
    top: 0;
    right: 0;
    padding: 0.5em;
}

.sol.error {
}

.sol.warning {
}

.sol.staticAnalysisWarning {
}

.sol.success {
  /* background-color:  // styles.rightPanel.message_Success_BackgroundColor; */
}</style>`

module.exports = css
