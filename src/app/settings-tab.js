var yo = require('yo-yo')

module.exports = settingsTab

function settingsTab () {
  return yo`
    <div id="settingsView">
      <div class="version crow"><strong>Current Solidity version:</strong> <span id="version">( Loading... )</span></div>
      <div class="crow">Switch version: <select id="versionSelector"></select></div>
      <div class="crow">
        <label for="editorWrap"><input id="editorWrap" type="checkbox">Text Wrap</label>
        <label for="optimize"><input id="optimize" type="checkbox">Enable Optimization</label>
        <label for="autoCompile"><input id="autoCompile" type="checkbox" checked>Auto Compile</label>
        <button id="compile" title="Compile source code">Compile</button>
      </div>
    </div>
  `
}
