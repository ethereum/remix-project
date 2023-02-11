import type { Profile } from '@remixproject/plugin-utils'
import { pluginManagerProfile } from '@remixproject/plugin-api'
import { Plugin } from "./abstract"

export type BasePluginManager = {
  // Exposed methods
  getProfile(name: string): Promise<Profile>
  updateProfile(profile: Partial<Profile>): Promise<any>
  activatePlugin(name: string): Promise<any>
  deactivatePlugin(name: string): Promise<any>
  isActive(name: string): Promise<boolean>
  canCall(from: Profile, to: Profile, method: string): Promise<boolean>
  // Internal
  toggleActive(name: string): any
  addProfile(profiles: Partial<Profile> | Partial<Profile>[]): any
  canActivatePlugin(from: Profile, to: Profile, method?: string): Promise<boolean>
  canDeactivatePlugin(from: Profile, to: Profile): Promise<boolean>
} & Plugin


interface ManagerProfile extends Profile {
  name: 'manager',
}

/** 
 * Wait for all promises to settle
 * catch if one of them fail
 */
function catchAllPromises(promises: Promise<any>[]) {
  return new Promise((res, rej) => {
    const resolved = [];
    const rejected = [];
    let ended = 0;
    const settle = (value: any, err: any) => {
      if (err) rejected.push(err)
      if (value) resolved.push(value)
      if (++ended === promises.length) {
        rejected.length ? rej(resolved) : res(rejected);
      }
    }
    for (const promise of promises) {
      promise
      .then(value => settle(value, null))
      .catch(err => settle(null, err))
    }
  })
}

export class PluginManager extends Plugin implements BasePluginManager {
  protected profiles: Record<string, Profile> = {}
  protected actives: string[] = []

  protected onPluginActivated?(profile: Profile): any
  protected onPluginDeactivated?(profile: Profile): any
  protected onProfileAdded?(profile: Profile): any

  constructor(profile: ManagerProfile = pluginManagerProfile) {
    super(profile)
  }

  /** Return the name of the caller. If no request provided, this mean that the method has been called from the IDE so we use "manager" */
  get requestFrom() {
    return this.currentRequest?.from || 'manager'
  }

  /** Run engine activation. Implemented by Engine */
  private engineActivatePlugin(name: string): Promise<any> {
    const error = `You cannot activate plugin "${name}", manager plugin is not register yet. `
    const solution = 'Run "engine.register(manager)" first'
    throw new Error(error + solution)
  }

  /** Run engine deactivation. Implemented by Engine */
  private engineDeactivatePlugin(name: string): Promise<any> {
    const error = `You cannot deactivate plugin "${name}", manager plugin is not register yet. `
    const solution = 'Run "engine.register(manager)" first'
    throw new Error(error + solution)
  }

  /**
   * Get the profile if it's registered.
   * @param name The name of the plugin
   * @note This method can be overrided
   */
  async getProfile(name: string) {
    return this.profiles[name]
  }

  /** Get all the profiles of the manager */
  getProfiles() {
    return Object.values(this.profiles)
  }

  /** Get all active profiles of the manager */
  getActiveProfiles() {
    return this.actives.map(name => this.profiles[name])
  }

  /**
   * Update the profile of the plugin
   * @param profile The Updated version of the plugin
   * @note Only the caller plugin should be able to update its profile
   */
  async updateProfile(to: Partial<Profile>) {
    if (!to) return
    if (!this.profiles[to.name]) {
      throw new Error(`Plugin ${to.name} is not register, you cannot update it's profile.`)
    }
    const from = await this.getProfile(this.requestFrom)
    await this.canUpdateProfile(from, to)
    this.profiles[to.name] = {
      ...this.profiles[to.name],
      ...to
    }
    this.emit('profileUpdated', this.profiles[to.name])
  }

  /**
   * Add a profile to the list of profile
   * @param profile The profile to add
   * @note This method should only be used by the engine
   */
  addProfile(profiles: Profile | Profile[]) {
    const add = (profile: Profile) => {
      if (this.profiles[profile.name]) {
        throw new Error(`Plugin ${profile.name} already exist`)
      }
      this.profiles[profile.name] = profile
      // emit only if manager is already activated
      if (this.actives.includes('manager')) {
        this.emit('profileAdded', profile)
      }
      if (this.onProfileAdded) {
        this.onProfileAdded(profile)
      }
    }
    return Array.isArray(profiles) ?  profiles.map(add) : add(profiles)
  }

  /**
   * Verify if a plugin is currently active
   * @param name Name of the plugin
   */
  async isActive(name: string) {
    return this.actives.includes(name)
  }

  /**
   * Check if caller can activate plugin and activate it if authorized
   * @param name The name of the plugin to activate
   */
  async activatePlugin(names: string | string[]) {
    if (!this.actives.includes('manager')) {
      await this.toggleActive('manager');
    }
    const activate = async (name: string) => {
      const isActive = await this.isActive(name)
      if (isActive) return
      const [ to, from ] = await Promise.all([
        this.getProfile(name),
        this.getProfile(this.requestFrom)
      ])
      const canActivate = await this.canActivatePlugin(from, to)
      if (canActivate) {
        await this.toggleActive(name)
      } else {
        throw new Error(`Plugin ${this.requestFrom} has no right to activate plugin ${name}`)
      }
    }
    return Array.isArray(names) ? catchAllPromises(names.map(activate)) : activate(names)
  }

  /**
   * Check if caller can deactivate plugin and deactivate it if authorized
   * @param name The name of the plugin to activate
   */
  async deactivatePlugin(names: string | string[]) {
    const deactivate = async (name: string) => {
      const isActive = await this.isActive(name)
      if (!isActive) return
      const [ to, from ] = await Promise.all([
        this.getProfile(name),
        this.getProfile(this.requestFrom)
      ])
      // Manager should have all right else plugin could totally block deactivation
      if (from.name === 'manager') {
        return this.toggleActive(name)
      }
      // Check manager rules
      const managerCanDeactivate = await this.canDeactivatePlugin(from, to)
      if (!managerCanDeactivate) {
        throw new Error(`Plugin ${this.requestFrom} has no right to deactivate plugin ${name}`)
      }
      // Ask plugin, if it wasn't the one which called on the first place
      const pluginCanDeactivate = from.name !== to.name ? await this.call(to.name, 'canDeactivate', from) : true
      if (!pluginCanDeactivate) {
        throw new Error(`Plugin ${this.requestFrom} has no right to deactivate plugin ${name}`)
      }
      return this.toggleActive(name)
    }
    return Array.isArray(names) ? catchAllPromises(names.map(deactivate)) : deactivate(names)
  }

  /**
   * Activate or deactivate by bypassing permission
   * @param name The name of the plugin to activate
   * @note This method should ONLY be used by the IDE
   */
  async toggleActive(names: string | string[]) {
    const toggle = async (name: string) => {
      const [isActive, profile] = await Promise.all([
        this.isActive(name),
        this.getProfile(name)
      ])
      if (isActive) {
        await this.engineDeactivatePlugin(name)
        this.actives = this.actives.filter(pluginName => pluginName !== name)
        this.emit('pluginDeactivated', profile)
        if (this.onPluginDeactivated) {
          this.onPluginDeactivated(profile)
        }
      } else {
        await this.engineActivatePlugin(name)
        this.actives.push(name)
        this.emit('pluginActivated', profile)
        if (this.onPluginActivated) {
          this.onPluginActivated(profile)
        }
      }
    }
    return Array.isArray(names) ? Promise.all(names.map(toggle)) : toggle(names)
  }

  /**
   * Check if a plugin can activate another
   * @param from Profile of the caller plugin
   * @param to Profile of the target plugin
   * @note This method should be overrided
   */
  async canActivatePlugin(from: Profile, to: Profile) {
    return true
  }

  /**
   * Check if a plugin can deactivate another
   * @param from Profile of the caller plugin
   * @param to Profile of the target plugin
   * @note This method should be overrided
   */
  async canDeactivatePlugin(from: Profile, to: Profile) {
    if (from.name === 'manager' || from.name === to.name) {
      return true
    }
    return false
  }

  /**
   * Check if a plugin can call a method of another
   * @param from Profile of the caller plugin
   * @param to Profile of the target plugin
   * @param method Method targetted by the caller
   * @param message Method provided by the targetted method plugin
   */
  async canCall(from: Profile, to: Profile, method: string, message?: string) {
    return true
  }


  /**
   * Check if a plugin can update profile of another one
   * @param from Profile of the caller plugin
   * @param to Updates on the profile of the target plugin
   * @note This method can be overrided
   */
  async canUpdateProfile(from: Profile, to: Partial<Profile>) {
    if (to.name && from.name !== to.name) {
      throw new Error('A plugin cannot change its name.')
    }
    if (to['url'] && to['url'] !== this.profiles[to.name]['url']) {
      throw new Error('Url from Profile cannot be updated.')
    }
    return true;
  }
}


