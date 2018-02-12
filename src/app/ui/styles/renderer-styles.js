var yo = require('yo-yo')

var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = yo`<style>
.sol.success,
.sol.error,
.sol.warning {
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
.sol.warning pre {
    overflow-y: hidden;
    background-color: transparent;
    margin: 0;
    font-size: 12px;
    border: 0 none;
    padding: 0;
    border-radius: 0;
}

.sol.success .close,
.sol.error .close,
.sol.warning .close {
    font-weight: bold;
    position: absolute;
    color: hsl(0, 0%, 0%); /* black in style-guide.js */
    top: 0;
    right: 0;
    padding: 0.5em;
}

.sol.error {
    background-color: ${styles.rightPanel.message_Error_BackgroundColor};
    border: .2em dotted ${styles.rightPanel.message_Error_BorderColor};
    color: ${styles.rightPanel.message_Error_Color};
}

.sol.warning {
  background-color: ${styles.rightPanel.message_Warning_BackgroundColor};
  color: ${styles.rightPanel.message_Warning_Color};
}

.sol.success {
  background-color: ${styles.rightPanel.message_Success_BackgroundColor};
  border: .2em dotted ${styles.rightPanel.message_Success_BorderColor};
  color: ${styles.rightPanel.message_Success_Color};
}</style>`

module.exports = css
