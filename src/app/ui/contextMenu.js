var yo = require('yo-yo')
// -------------- copyToClipboard ----------------------
var csjs = require('csjs-inject')

var css = csjs`
    .container
    {
      display: none;
      position: fixed;
      width:100px;
      border-radius: 2px;
      z-index: 1000;
      box-shadow: 0 0 4px var(--dark);
    }
    .liitem
    {
      padding: 2px;
      padding-left: 6px;
      cursor: pointer;
      color: var(--text-dark);
      background-color: var(--light);
    }
    .liitem:hover
    {
      background-color:  var(--secondary);
    }
    #menuitems
    {
      list-style: none;
      margin: 0px;
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
  var container = yo`<div class="${css.container} bg-light"><ul id='menuitems'>${menu}</ul></div>`
  container.style.left = event.pageX + 'px'
  container.style.top = event.pageY + 'px'
  container.style.display = 'block'

  document.querySelector('body').appendChild(container)
  setTimeout(() => {
    window.addEventListener('click', hide)
  }, 500)

  return { hide }
}
