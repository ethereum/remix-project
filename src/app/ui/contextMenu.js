var yo = require('yo-yo')
// -------------- copyToClipboard ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
    .container
    {
        display: none;
        position: fixed;
        border: 1px solid ${styles.appProperties.solidBorderBox_BorderColor};
        width:150px; 
        background: ${styles.appProperties.solidBorderBox_BackgroundColor};
        border-radius: 2px;
        z-index: 1000;
    }
    
    .liitem
    {
        padding: 3px;
        padding-left: 10px;
        cursor: pointer;
    }
    
    #menuitems
    {
        list-style: none;
        margin: 0px;
        margin-top: 4px;
        padding-left: 5px;
        padding-right: 5px;
        padding-bottom: 3px;
        color: ${styles.appProperties.solidBorderBox_TextColor};
    }

    #menuitems :hover
    {
        background: ${styles.appProperties.highlight_BackgroundColor};
        border-radius: 2px;
    }
`

module.exports = (event, items) => {
  event.preventDefault()

  function hide (event, force) {
    if (container && container.parentElement && (force || (event.target !== container))) {
      container.parentElement.removeChild(container)
    }
    window.removeEventListener('click', hide)
  }

  var menu = Object.keys(items).map((item, index) => {
    var current = yo`<li id="menuitem${item.toLowerCase()}" class=${css.liitem}>${item}</li>`
    current.onclick = () => { hide(null, true); items[item]() }
    return current
  })
  var container = yo`<div class=${css.container}><ul id='menuitems'>${menu}</ul></div>`
  container.style.left = event.pageX + 'px'
  container.style.top = event.pageY + 'px'
  container.style.display = 'block'

  document.querySelector('body').appendChild(container)
  setTimeout(() => {
    window.addEventListener('click', hide)
  }, 500)
}
