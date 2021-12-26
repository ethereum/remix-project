import type { Message, Profile, ExternalProfile, LocationProfile } from '@remixproject/plugin-utils'
import { PluginConnector } from '@remixproject/engine'
import React from 'react' // eslint-disable-line
import IFramePluginView from '../components/panels/iFramePluginView'

export type IframeProfile = Profile & LocationProfile & ExternalProfile

/**
 * Connect an Iframe client to the engine.
 * @dev This implements the ViewPlugin as it cannot extends two class. Maybe use a mixin at some point
 */
class IframeReactPlugin extends PluginConnector {
  // Listener is needed to remove the listener
  private readonly listener = ['message', (e: MessageEvent) => this.getEvent(e), false] as const
  private container: any
  private origin: string
  private source: Window
  private url: string

  constructor (public profile: IframeProfile) {
    super(profile)
  }

  /** Implement "activate" of the ViewPlugin */
  connect (url: string) {
    this.profile.url = url
    this.render()
  }

  addToView () {
    this.call(this.profile.location, 'addView', this.profile, this.container)
  }

  shake (iframe: any) {
    return new Promise((resolve, reject) => {
      // Wait for the iframe to load and handshake

      if (!iframe.contentWindow) {
        reject(new Error(`${this.name} plugin cannot find url ${this.profile.url}`))
      }
      this.origin = new URL(iframe.src).origin
      this.source = iframe.contentWindow
      window.addEventListener(...this.listener)
      this.handshake()
        .then(resolve)
        .catch(reject)
      //
    })
  }

  /** Implement "deactivate" of the ViewPlugin */
  disconnect () {
    console.trace('disconnect')
    window.removeEventListener(...this.listener)
    return this.call(this.profile.location, 'removeView', this.profile)
      .catch(console.error)
  }

  /** Get message from the iframe */
  private async getEvent (event: MessageEvent) {
    if (event.source !== this.source) return // Filter only messages that comes from this iframe
    if (event.origin !== this.origin) return // Filter only messages that comes from this origin
    const message: Message = event.data
    this.getMessage(message)
  }

  /**
   * Post a message to the iframe of this plugin
   * @param message The message to post
   */
  protected send (message: Partial<Message>) {
    if (!this.source) {
      throw new Error('No window attached to Iframe yet')
    }
    this.source.postMessage(message, this.origin)
  }

  /** Create and return the iframe */
  render () {
    this.container = <IFramePluginView plugin={this} />
    this.addToView()
  }
}

export default IframeReactPlugin
