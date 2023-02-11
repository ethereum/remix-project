import { StatusEvents, Profile } from '@remixproject/plugin-utils'

export interface IPluginManager {
  events: {
    profileUpdated(profile: Profile): void
    profileAdded(profile: Profile): void
    pluginDeactivated(profile: Profile): void
    pluginActivated(profile: Profile): void
  } & StatusEvents
  methods: {
    getProfile(name: string): Promise<Profile>
    updateProfile(profile: Partial<Profile>): any
    activatePlugin(name: string): any
    deactivatePlugin(name: string): any
    isActive(name: string): boolean
    canCall(from: string, to: string, method: string, message?: string): any
  }
}
