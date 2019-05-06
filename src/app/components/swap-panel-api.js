import EventEmmitter from 'events'

class SwapPanelApi {
  constructor (swapPanelComponent, verticalIconsComponent) {
    this.event = new EventEmmitter()
    this.component = swapPanelComponent
    this.currentContent
    verticalIconsComponent.events.on('toggleContent', (moduleName) => {
      if (!swapPanelComponent.contents[moduleName]) return
      if (this.currentContent === moduleName) {
        this.event.emit('toggle', moduleName)
        return
      }
      this.showContent(moduleName)
      this.event.emit('showing', moduleName)
    })

    verticalIconsComponent.events.on('showContent', (moduleName) => {
      if (!swapPanelComponent.contents[moduleName]) return
      this.showContent(moduleName)
      this.event.emit('showing', moduleName)
    })
  }

  showContent (moduleName) {
    this.component.showContent(moduleName)
    this.currentContent = moduleName
  }

  /*
    content: DOM element
    by appManager
  */
  add (profile, content) {
    return this.component.add(profile.name, content)
  }

  remove (profile) {
    return this.component.remove(profile.name)
  }
}

module.exports = SwapPanelApi
