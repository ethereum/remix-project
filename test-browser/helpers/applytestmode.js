/**
 * This script is injected by NightWatch just before starting test
 *
 */
console.log('applying test mode')
document.getElementById('input').editor.setBehavioursEnabled(false) // disable bracket auto-match (i.e. automatic injection of closing brackets and other things), so we can enter raw source code.
console.log('test mode applied')
