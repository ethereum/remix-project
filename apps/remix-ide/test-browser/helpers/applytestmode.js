/**
 * This script is injected by NightWatch just before starting test
 *
 */
console.log('applying test mode')
var editor = document.getElementById('input').editor
editor.setBehavioursEnabled(false) // disable bracket auto-match (i.e. automatic injection of closing brackets and other things), so we can enter raw source code.
editor.setOptions({
  enableBasicAutocompletion: false,
  enableSnippets: false,
  enableLiveAutocompletion: false
})
console.log('test mode applied')
