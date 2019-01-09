// API
class VerticalIconsApi {

  constructor (verticalIconsComponent, pluginManagerComponent) {
    this.component = verticalIconsComponent
    pluginManagerComponent.event.on('requestContainer', (mod, content) => verticalIconsComponent.addIcon(mod))
  }
}
module.exports = VerticalIconsApi
