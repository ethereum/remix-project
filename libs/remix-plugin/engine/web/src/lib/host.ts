import type { Profile } from '@remixproject/plugin-utils'
import { Plugin } from '@remixproject/engine'

// @todo(#250): move this into engine-web
export abstract class HostPlugin extends Plugin {

  constructor(profile: Profile) {
    // Remove duplicated if needed
    const methods = Array.from(new Set([
      ...(profile.methods || []),
      'currentFocus', 'focus', 'addView', 'removeView'
    ]))
    super({...profile, methods })
  }

  /**  Give the name of the current focus plugin */
  abstract currentFocus(): string

  /** Display the view inside the host */
  abstract focus(name: string): void

  /** Add the view of a plugin into the DOM */
  abstract addView(profile: Profile, view: Element): void

  /** Remove the plugin from the view from the DOM */
  abstract removeView(profile: Profile): void
}