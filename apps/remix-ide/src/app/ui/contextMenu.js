var yo = require('yo-yo')
// -------------- copyToClipboard ----------------------
var csjs = require('csjs-inject')

var css = csjs`
    .container
    {
      display: none;
      position: fixed;
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

  const menu = Object.keys(items).map((item, index) => {
    const current = yo`<li id="menuitem${item.toLowerCase()}" class=${css.liitem}>${item}</li>`
    current.onclick = () => { hide(null, true); items[item]() }
    return current
  })
  const container = yo`<div id="menuItemsContainer" class="p-1 ${css.container} bg-light shadow border"><ul id='menuitems'>${menu}</ul></div>`

  container.style.left = event.pageX + 'px'
  container.style.top = event.pageY + 'px'
  container.style.display = 'block'
  document.querySelector('body').appendChild(container)

  const menuItemsContainer = document.getElementById('menuItemsContainer')
  const boundary = menuItemsContainer.getBoundingClientRect()

  if (boundary.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
    menuItemsContainer.style.position = 'absolute'
    menuItemsContainer.style.bottom = '10px'
    menuItemsContainer.style.top = null
  }

  setTimeout(() => {
    window.addEventListener('click', hide)
  }, 500)

  return { hide }
}
