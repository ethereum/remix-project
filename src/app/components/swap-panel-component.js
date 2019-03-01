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

    appManager.event.on('pluginNeedsLocation', (profile, domEl) => {
      if ((profile.prefferedLocation === this.name) || (!profile.prefferedLocation && opt.default)) {
        this.add(profile.name, domEl)
      }
    })

    this.store.event.on('activate', (name) => {
      const { profile, api } = this.store.getOne(name)
      if (((profile.prefferedLocation === this.name) || (!profile.prefferedLocation && opt.default)) &&
        profile.icon && api.render && typeof api.render === 'function') {
        this.add(name, api.render())
      }
    })

    this.store.event.on('deactivate', (name) => {
      if (this.contents[name]) this.remove(name)
    })
    this.store.event.on('add', (entity) => { })
    this.store.event.on('remove', (entity) => { })
  }

  showContent (moduleName) {
    // hiding the current view and display the `moduleName`
    if (this.contents[moduleName]) {
      if (this.currentNode) {
        this.contents[this.currentNode].style.display = 'none'
      }
      this.contents[moduleName].style.display = 'block'
      this.currentNode = moduleName
      var item = this.store.getOne(moduleName)
      this.header.innerHTML = item.profile ? item.profile.displayName : ' - '
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
      <div id='plugins' class=${css.plugins} >
      </div>
    `
    this.header = yo`<header class="navbar navbar-dark bg-dark text-warning"><h2 class="navbar-brand"></h2> </header>`
    if (!this.opt.displayHeader) this.header.style.display = 'none'

    return yo`<div>
        ${this.header}
        ${this.view}
        </div>`
  }
}

module.exports = SwapPanelComponent

const css = csjs`
  .plugins        {
    height         : 100%;
    overflow-y     : auto;
  }
  .plugItIn       {
    display        : none;
    height         : 100%;
  }
  .plugItIn.active     {
    display        : block;
  }
`
