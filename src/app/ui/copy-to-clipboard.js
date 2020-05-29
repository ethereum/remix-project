var yo = require('yo-yo')
// -------------- copyToClipboard ----------------------
const copy = require('copy-text-to-clipboard')
var addTooltip = require('./tooltip')
// -------------- styling ----------------------
var csjs = require('csjs-inject')

var css = csjs`
  .copyIcon {
    margin-left: 5px;
    cursor: pointer;
  }
`

module.exports = function copyToClipboard (getContent, tip = 'Copy value to clipboard', icon = 'fa-copy') {
  var copyIcon = yo`<i title="${tip}" class="${css.copyIcon} far ${icon} p-2" data-id="copyToClipboardCopyIcon" aria-hidden="true"></i>`
  copyIcon.onclick = (event) => {
    event.stopPropagation()
    var copiableContent
    try {
      copiableContent = getContent()
    } catch (e) {
      addTooltip(e.message)
      return
    }
    if (copiableContent) {   // module `copy` keeps last copied thing in the memory, so don't show tooltip if nothing is copied, because nothing was added to memory
      try {
        if (typeof copiableContent !== 'string') {
          copiableContent = JSON.stringify(copiableContent, null, '\t')
        }
      } catch (e) {}
      copy(copiableContent)
      addTooltip('Copied value to clipboard.')
    } else {
      addTooltip('Cannot copy empty content!')
    }
  }
  return copyIcon
}
