// API
class VerticalIconsApi {

  constructor (verticalIconsComponent) {
    this.component = verticalIconsComponent
  }

  addIcon (mod) {
    this.component.addIcon(mod)
  }

  removeIcon (mod) {
    this.component.removeIcon(mod)
  }

  select (moduleName) {
    this.component.select(moduleName)
  }
}
module.exports = VerticalIconsApi
