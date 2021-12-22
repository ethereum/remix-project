import type { Message, Profile, ExternalProfile, LocationProfile } from '@remixproject/plugin-utils'
import { PluginConnector } from '@remixproject/engine'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import IFramePluginView from '../components/panels/iFramePluginView'

export type IframeProfile = Profile & LocationProfile & ExternalProfile

/**
 * Connect an Iframe client to the engine.
 * @dev This implements the ViewPlugin as it cannot extends two class. Maybe use a mixin at some point
 */
class IframeReactPlugin extends PluginConnector {
  // Listener is needed to remove the listener
  private readonly listener = ['message', (e: MessageEvent) => this.getEvent(e), false] as const
  private iframe = document.createElement('iframe')
  private container = document.createElement('div')
  private origin: string
  private source: Window
  private url: string

  constructor (public profile: IframeProfile) {
    super(profile)
    console.log('IframeReactPlugin', profile)
  }

  /** Implement "activate" of the ViewPlugin */
  connect (url: string) {
    console.log('connect', url)
    this.url = url
    this.render()
  }

  addToView () {
    this.call(this.profile.location, 'addView', this.profile, this.container.getElementsByTagName('iframe')[0])
  }

  shake (iframe: any) {
    console.log('shake', iframe)
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
    this.iframe.remove()
    window.removeEventListener(...this.listener)
    // @todo(#252) should be managed by an ErrorHandler instead
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
    ReactDOM.render(<IFramePluginView plugin={this} />, this.container)
  }
}

export default IframeReactPlugin
