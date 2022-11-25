/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plugin } from "@remixproject/engine/lib/abstract";
import { EventEmitter } from "events";
export interface LocaleModule extends Plugin<any, any> {
    currentLocaleState: Record<string, unknown>;
    new(): any;
    events: EventEmitter;
    _deps: {
        config: any;
    };
    _paq: any
    element: HTMLDivElement;
    locales: {[key: string]: Locale};
    active: string;
    forced: boolean;
    render(): HTMLDivElement;
    renderComponent(): void;
    /** Return the active locale */
    currentLocale(): Locale;
    /** Returns all locales as an array */
    getLocales(): Locale[];
    /**
     * Change the current locale
     * @param {string} [localeName] - The name of the locale
     */
    switchLocale(localeName?: string): void;
}

interface Locale { name: string, messages: any }
