export type PluginManagerSettings = {
  openDialog: () => void
  onValidation: () => void
  clearPermission: (from: any, to: any, method: any) => void
  settings: () => HTMLElement
  render: () => HTMLElement
}
