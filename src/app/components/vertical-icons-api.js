// API
class VerticalIconsApi {

  constructor (verticalIconsComponent, pluginManagerComponent) {
    this.component = verticalIconsComponent
    pluginManagerComponent.event.on('requestContainer', (mod, content) => verticalIconsComponent.addIcon(mod))
    pluginManagerComponent.event.on('removingItem', (mod) => verticalIconsComponent.removeIcon(mod))
  }
}
module.exports = VerticalIconsApi
