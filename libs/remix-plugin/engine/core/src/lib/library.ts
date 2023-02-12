import type { EventEmitter } from 'events'
import type { Api, Profile, LibraryProfile, LocationProfile } from '@remixproject/plugin-utils'
import { Plugin } from './abstract'

export type LibraryApi<T extends Api, P extends Profile> = {
  [method in P['methods'][number]]: T['methods'][method]
} & {
  events?: EventEmitter
} & {
  render?(): Element
}

type LibraryViewProfile = LocationProfile & LibraryProfile

export function isViewLibrary(profile): profile is LibraryViewProfile {
  return !!profile.location
}

export class LibraryPlugin<
  T extends Api = any,
  P extends LibraryProfile | LibraryViewProfile = any
> extends Plugin {

  private isView: boolean
  protected library: LibraryApi<T, P>
  public profile: P
  constructor(library: LibraryApi<T, P>, profile: P) 
  {
    super(profile)
    this.library = library
    this.profile = profile
    profile.methods.forEach(method => {
      if (!library[method]) {
        throw new Error(`Method ${method} is exposed by LibraryPlugin ${profile.name}. But library doesn't expose this method`)
      }
    })
    this.isView = isViewLibrary(profile)
    if (this.isView && !this['render']) {
      throw new Error(
        `Profile ${profile.name} define the location ${(profile as LibraryViewProfile).location}, but method "render" is not implemented`
      )
    }
  }

  async activate() {
    if (this.isView) {
      await this.call((this.profile as LibraryViewProfile).location, 'addView', this.profile, this['render']())
    }

    // Forward event to the library
    if (this.profile.notifications) {
      if (!this.library.events || !this.library.events.emit) {
        throw new Error(`"events" object from Library of plugin ${this.name} should implement "emit"`)
      }
      Object.keys(this.profile.notifications).forEach(name => {
        this.profile.notifications[name].forEach(key => {
          this.on(name, key, (payload: any[]) => this.library.events.emit(`[${name}] ${key}`, ...payload))
        })
      })
    }
    // Start listening on events from the library
    if (this.profile.events) {
      if (!this.library.events || !this.library.events.emit) {
        throw new Error(`"events" object from Library of plugin ${this.name} should implement "emit"`)
      }
      this.profile.events.forEach(event => {
        this.library.events.on(event, (...payload) => this.emit(event, ...payload))
      })
    }
    // Start listening before running onActivation
    super.activate()
  }

  deactivate() {
    if (this.isView) {
      this.call((this.profile as LibraryViewProfile).location, 'removeView', this.profile)
    }
    // Stop listening on events
    if (this.profile.notifications) {
      Object.keys(this.profile.notifications).forEach(name => {
        this.profile.notifications[name].forEach(key => this.off(name, key))
      })
    }
    // Stop listening on events from the library
    this.profile.events?.forEach(e => this.library.events?.removeAllListeners(e))
    super.deactivate()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, payload: any[]) {
    if (!this.library[key]) {
      throw new Error(`LibraryPlugin ${this.name} doesn't expose method ${key}`)
    }
    return this.library[key](...payload)
  }
}
