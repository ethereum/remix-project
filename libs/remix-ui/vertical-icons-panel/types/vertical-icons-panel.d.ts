/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-use-before-define */
import { Plugin } from '@remixproject/engine/lib/abstract'
import * as packageJson from '../../../../package.json'
import { Registry } from 'apps/remix-ide/src/app/state/registry'

import { RemixAppManager } from '@remix-ui/plugin-manager'

export type Kind =
  | 'fileexplorer'
  | 'compiler'
  | 'udapp'
  | 'testing'
  | 'analysis'
  | 'debugging'
  | 'settings'
  | 'none'

type IconKindType = {
  kind: {}
}

interface defaultModuleProfile {
  name: string
  displayName: string
  description: string
  version: packageJson.version
  methods: string[]
}

interface PassedProfile {
  name: string
  displayName: string
  description: string
  version: packageJson.version
  methods: string[]
  icon?: string
  tooltip?: string
  kind?: string
  documentation?: string
}

interface targetProfileIcons {
  profile: PassedProfile
}
export class VerticalIcons extends Plugin<any, any> {
  events: EventEmitter
  appManager: RemixAppManager
  htmlElement: HTMLDivElement
  icons: any
  iconKind: {}
  iconStatus: {}
  defaultProfile: defaultModuleProfile
  targetProfileForChange: any
  targetProfileForRemoval: any
  registry: Registry
  keys: string[]
  types: string[]
  renderComponent(): void
  linkContent(profile: any): void
  unlinkContent(profile: any): void
  listenOnStatus(profile: any): void
  activateHome(): void
  /**
   * Add an icon to the map
   * @param {ModuleProfile} profile The profile of the module
   */
  addIcon({ kind, name, icon, displayName, tooltip, documentation }: any): void
  /**
   * resolve a classes list for @arg key
   * @param {Object} key
   * @param {Object} type
   */
  resolveClasses(key: any, type: any): any
  /**
   * Set a new status for the @arg name
   * @param {String} name
   * @param {Object} status
   */
  setIconStatus(name: string, status: any): void
  /**
   * Remove an icon from the map
   * @param {ModuleProfile} profile The profile of the module
   */
  removeIcon({ name }: any): void
  /**
   *  Remove active for the current activated icons
   */
  removeActive(): void
  /**
   *  Add active for the new activated icon
   * @param {string} name Name of profile of the module to activate
   */
  addActive(name: string): void
  /**
   * Set an icon as active
   * @param {string} name Name of profile of the module to activate
   */
  select(name: string): void
  /**
   * Toggles the side panel for plugin
   * @param {string} name Name of profile of the module to activate
   */
  toggle(name: string): void
  updateActivations(name: any): void
  onThemeChanged(themeType: any): void
  itemContextMenu(e: any, name: any, documentation: any): Promise<void>
  render(): any
  view: any
}
import EventEmitter = require('events')

