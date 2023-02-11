import { IPluginManager } from './api'
import { LibraryProfile } from '@remixproject/plugin-utils'

export const pluginManagerProfile: LibraryProfile<IPluginManager> & { name: 'manager' } = {
  name: 'manager',
  methods: ['getProfile', 'updateProfile', 'activatePlugin', 'deactivatePlugin', 'isActive', 'canCall'],
  events: ['pluginActivated', 'pluginDeactivated', 'profileAdded', 'profileUpdated']
}
