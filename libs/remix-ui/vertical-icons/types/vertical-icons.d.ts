import { Plugin } from '@remixproject/engine/lib/abstract'
export class VerticalIcons extends Plugin<any, any> {
  constructor(appManager: any);
    events: EventEmitter;
    appManager: any;
    htmlElement: HTMLDivElement;
    icons: {};
  iconKind: {
    kind:
    'fileexplorer' | 'compiler' | 'udapp' | 'testing' | 'analysis' | 'debugging' | 'settings' | 'none'
    };
    iconStatus: {};
    renderComponent(): void;
    linkContent(profile: any): void;
    unlinkContent(profile: any): void;
    listenOnStatus(profile: any): void;
    logoShow(): void;
    /**
     * Add an icon to the map
     * @param {ModuleProfile} profile The profile of the module
     */
    addIcon({ kind, name, icon, displayName, tooltip, documentation }: any): void;
    /**
     * resolve a classes list for @arg key
     * @param {Object} key
     * @param {Object} type
     */
    resolveClasses(key: any, type: any): any;
    /**
     * Set a new status for the @arg name
     * @param {String} name
     * @param {Object} status
     */
    setIconStatus(name: string, status: any): void;
    /**
     * Remove an icon from the map
     * @param {ModuleProfile} profile The profile of the module
     */
    removeIcon({ kind, name }: any): void;
    /**
     *  Remove active for the current activated icons
     */
    removeActive(): void;
    /**
     *  Add active for the new activated icon
     * @param {string} name Name of profile of the module to activate
     */
    addActive(name: string): void;
    /**
     * Set an icon as active
     * @param {string} name Name of profile of the module to activate
     */
    select(name: string): void;
    /**
     * Toggles the side panel for plugin
     * @param {string} name Name of profile of the module to activate
     */
    toggle(name: string): void;
    updateActivations(name: any): void;
    onThemeChanged(themeType: any): void;
    itemContextMenu(e: any, name: any, documentation: any): Promise<void>;
    render(): any;
    view: any;
}
import EventEmitter = require('events');
