var yo = require('yo-yo')
var csjs = require('csjs-inject')

class SwapPanelComponent {
  constructor (name, appStore, appManager, opt) {
    this.name = name
    this.opt = opt
    this.store = appStore
    // list of contents
    this.contents = {}
    // name of the current displayed content
    this.currentNode

    this.store.event.on('activate', (name) => {
      const api = this.store.getOne(name)
      const profile = api.profile
      if (((profile.location === this.name) || (!profile.location && opt.default)) &&
        profile.icon && api.render && typeof api.render === 'function') {
        this.add(name, api.render())
      }
    })

    this.store.event.on('deactivate', (name) => {
      if (this.contents[name]) this.remove(name)
    })
    this.store.event.on('add', (api) => { })
    this.store.event.on('remove', (api) => { })
  }

  showContent (moduleName) {
    // hiding the current view and display the `moduleName`
    if (this.contents[moduleName]) {
      if (this.currentNode) {
        this.contents[this.currentNode].style.display = 'none'
      }
      this.contents[moduleName].style.display = 'block'
      this.currentNode = moduleName
      var api = this.store.getOne(moduleName)
      this.header.querySelector('h6').innerHTML = api.profile ? api.profile.displayName : ' - '
      return
    }
  }

  add (moduleName, content) {
    content.style.height = '100%'
    content.style.width = '100%'
    content.style.border = '0'
    this.contents[moduleName] = yo`<div class=${css.plugItIn} >${content}</div>`
    this.view.appendChild(this.contents[moduleName])
  }

  remove (moduleName) {
    let el = this.contents[moduleName]
    if (el) el.parentElement.removeChild(el)
  }

  render () {
    this.view = yo`
      <div id='plugins' class=${css.plugins}>
      </div>
    `
    this.header = yo`<header class="${css.swapitHeader}"><h6 class="${css.swapitTitle}"></h6></header>`
    if (!this.opt.displayHeader) this.header.style.display = 'none'

    return yo`<div class=${css.pluginsContainer}>
        ${this.header}
        ${this.view}
        </div>`
  }
}

module.exports = SwapPanelComponent

const css = csjs`
  .plugins        {
    height         : 95%;
  }
  .plugItIn       {
    display        : none;
    height         : 100%;
  }
  .plugItIn > div {
    overflow-y     : auto;
    height         : 100%;
    width          : 100%;
  }
  .plugItIn.active     {
    display        : block;
  }
  .pluginsContainer {
    height: 100%;
    overflow-y: hidden;
  }
  .swapitTitle {
    text-transform: uppercase;
  }
  .swapitHeader {
    height: 35px;
    padding-top: 10px;
    padding-left: 27px;
  }
`
