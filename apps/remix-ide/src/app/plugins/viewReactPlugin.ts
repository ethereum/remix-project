import type { Profile, LocationProfile } from '@remixproject/plugin-utils'
import { Plugin } from '@remixproject/engine'


export function isView<P extends Profile>(profile: Profile): profile is (ViewProfile & P) {
  return !!profile['location']
}

export type ViewProfile = Profile & LocationProfile

export abstract class ViewReactPlugin extends Plugin {
  abstract render(): any

  constructor(public profile: ViewProfile) {
    super(profile)
  }

  async activate() {
    await this.call(this.profile.location, 'addView', this.profile, this.render())
    super.activate()
  }

  deactivate() {
    this.call(this.profile.location, 'removeView', this.profile)
    super.deactivate()
  }
}