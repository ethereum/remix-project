// API
class VerticalIconsApi {

  constructor (verticalIconsComponent, appManager) {
    this.component = verticalIconsComponent
    appManager.event.on('requestContainer', (mod, content) => verticalIconsComponent.addIcon(mod))
    appManager.event.on('removingItem', (mod) => verticalIconsComponent.removeIcon(mod))
  }
}
module.exports = VerticalIconsApi
