import { PermissionHandler } from './app/ui/persmission-handler'
import { PluginManager } from '@remixproject/engine/lib/manager'
import { EventEmitter } from 'events'
import { Engine } from '@remixproject/engine/lib/engine'
/* eslint-disable camelcase */

// eslint-disable-next-line no-use-before-define
export = LocalPlugin;
declare class LocalPlugin {
  /**
  * Open a modal to create a local plugin
  * @param {Profile[]} plugins The list of the plugins in the store
  * @returns {Promise<{api: any, profile: any}>} A promise with the new plugin profile
  */
  open(plugins: any[]): Promise<{
        api: any;
        profile: any;
    }>;

    profile: any;
    /**
     * Create the object to add to the plugin-list
     */
    create(): any;
    updateName({ target }: {
        target: any;
    }): void;

    updateUrl({ target }: {
        target: any;
    }): void;

    updateDisplayName({ target }: {
        target: any;
    }): void;

    updateProfile(key: any, e: any): void;
    updateMethods({ target }: {
        target: any;
    }): void;

    /** The form to create a local plugin */
    form(): any;
}

declare module 'yo-yo'{
  interface yo_yo {
    (strings:string[], ...values:any[]):HTMLElement;
    update(element:HTMLElement, element2:HTMLElement);
  }
  var yo:yo_yo
  export = yo;
}

declare module 'dom-css'{
 interface dom_css{
   (element:HTMLElement, css:any):void;
 }

 var css:dom_css
 export = css;
}

interface SetPluginOptionType {
  queueTimeout: number
}

export interface _Paq {
  _paq: Window & typeof globalThis | []
}

export class RemixEngine extends Engine {
  event: EventEmitter;
  setPluginOption ({ name, kind }) : SetPluginOptionType
  onRegistration (plugin) : void
}

export function isNative(name: any): any;
/**
 * Checks if plugin caller 'from' is allowed to activate plugin 'to'
 * The caller can have 'canActivate' as a optional property in the plugin profile.
 * This is an array containing the 'name' property of the plugin it wants to call.
 * canActivate = ['plugin1-to-call','plugin2-to-call',....]
 * or the plugin is allowed by default because it is native
 *
 * @param {any, any}
 * @returns {boolean}
 */
export function canActivate(from: any, to: any): boolean;
export class RemixAppManager extends PluginManager {
  constructor();
    event: EventEmitter;
    pluginsDirectory: string;
    pluginLoader: PluginLoader;
    permissionHandler: PermissionHandler;
    getAll(): import('@remixproject/plugin-utils').Profile<any>[];
    getIds(): string[];
    isDependent(name: any): any;
    isRequired(name: any): any;
    registeredPlugins(): Promise<any>;
}

export interface PluginManagerContextProviderProps {
  appManager: RemixAppManager
  engine: RemixEngine
  _paq: _Paq
  filter: string
  actives: Profile[]
  inactives: Profile[]
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => boolean
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
  headingLabel: string
}

export interface RemixUiPluginManagerProps {
  appManager: RemixAppManager
  engine: RemixEngine
  localPlugin: LocalPlugin
  _paq: _Paq
  filter: string
  actives: Profile[]
  inactives: Profile[]
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => any
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
  headingLabel: string
}
/** @class Reference loaders.
 *  A loader is a get,set based object which load a workspace from a defined sources.
 *  (localStorage, queryParams)
 **/
declare class PluginLoader {
  get currentLoader(): any;
    donotAutoReload: string[];
    loaders: {};
    current: string;
    set(plugin: any, actives: any): void;
    get(): any;
}

export type PluginManagerSettings = {
  openDialog: () => void
  onValidation: () => void
  clearPermission: (from: any, to: any, method: any) => void
  settings: () => HTMLElement
  render: () => HTMLElement
}

export type LocalPluginType = {
  'iframe',
  'ws'
}

export type DefaultLocalPlugin = {
  type: string
  hash: string
  methods: any
  location: string
}

export interface FormStateProps extends DefaultLocalPlugin {
  name: string
  displayName: string
  url: string
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
  version: any
  type: 'iframe' | 'ws'
  hash: string
}

export type TileLabel = {
  label: 'Active Module' | 'Inactive Modules'
}

export type LocalPlugin = {
  create: () => Profile
  updateName: (target: string) => void
  updateDisplayName: (displayName: string) => void
  updateProfile: (key: string, e: Event) => void
  updateMethods: (target: any) => void
  form: () => HTMLElement
}

export { }
