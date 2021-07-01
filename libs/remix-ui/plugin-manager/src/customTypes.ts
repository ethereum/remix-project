export type PluginManagerSettings = {
  openDialog: () => void
  onValidation: () => void
  clearPermission: (from: any, to: any, method: any) => void
  settings: () => HTMLElement
  render: () => HTMLElement
}

export type Profile = {
  name: 'pluginManager',
  displayName: 'Plugin manager',
  methods: [],
  events: [],
  icon: 'assets/img/pluginManager.webp',
  description: 'Start/stop services, modules and plugins',
  kind: 'settings',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/plugin_manager.html',
  version: string
}
