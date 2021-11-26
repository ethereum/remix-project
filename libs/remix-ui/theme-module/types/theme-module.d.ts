import { Plugin } from "@remixproject/engine/lib/abstract";
import { EventEmitter } from "events";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ThemeModule extends Plugin<any, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(registry: any);
    events: EventEmitter;
    _deps: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: any;
    };
    element: HTMLDivElement;
    // eslint-disable-next-line @typescript-eslint/ban-types
    themes: {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    active: any;
    forced: boolean;
    render(): HTMLDivElement;
    renderComponent(): void;
    /** Return the active theme */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentTheme(): any;
    /** Returns all themes as an array */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getThemes(): any[];
    /**
     * Init the theme
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initTheme(callback: any): void;
    /**
     * Change the current theme
     * @param {string} [themeName] - The name of the theme
     */
    switchTheme(themeName?: string): void;
    /**
     * fixes the invertion for images since this should be adjusted when we switch between dark/light qualified themes
     * @param {element} [image] - the dom element which invert should be fixed to increase visibility
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixInvert(image?: any): void;
}
