import EventEmmitter from 'events'

class SwapPanelApi {
  constructor (swapPanelComponent, verticalIconsComponent, appManager) {
    this.event = new EventEmmitter()
    this.component = swapPanelComponent
    this.currentContent
    verticalIconsComponent.event.on('showContent', (moduleName) => {
      if (this.currentContent === moduleName) {
        this.event.emit('toggle')
        return
      }
      this.event.emit('showing', moduleName)
      this.component.showContent(moduleName)
      this.currentContent = moduleName
    })
    appManager.event.on('requestContainer', (mod, content) => {
      this.add(mod.name, content)
    })
    appManager.event.on('removingItem', (mod) => {
      this.remove(mod.name)
    })
  }

  /*
    content: DOM element
    by appManager
  */
  add (moduleName, content) {
    // add the DOM to the swappanel
    return this.component.add(moduleName, content)
  }

  remove (moduleName) {
    return this.component.remove(moduleName)
  }

  reference (modulename, domElement) {
    this.nodes[modulename] = domElement
  }
}

module.exports = SwapPanelApi
