/**
 * This script is injected by NightWatch just before starting test
 *
 */
console.log('applying test mode')
document.getElementById('input').editor.setBehavioursEnabled(false)
console.log('test mode applied')
