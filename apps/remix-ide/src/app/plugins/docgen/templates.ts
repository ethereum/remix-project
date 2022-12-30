import { mapKeys } from './utils/map-keys';
import { DocItemContext } from './site';

import * as defaultProperties from './common/properties';

export type PropertyGetter = (ctx: DocItemContext, original?: unknown) => unknown;
export type Properties = Record<string, PropertyGetter>;

export interface Templates {
  partials?: Record<string, () => string>;
  helpers?: Record<string, (...args: unknown[]) => string>;
  properties?: Record<string, PropertyGetter>;
}

/**
 * Loads the templates that will be used for rendering a site based on a
 * default theme and user templates.
 *
 * The result contains all partials, helpers, and property getters defined in
 * the user templates and the default theme, where the user's take precedence
 * if there is a clash. Additionally, all theme partials and helpers are
 * included with the theme prefix, e.g. `markdown/contract` will be a partial.
 */
export async function loadTemplates(defaultTheme: string, root: string, userTemplatesPath?: string): Promise<Templates> {
  const themes = await readThemes();

  // Initialize templates with the default theme.
  const templates: Required<Templates> = {
    partials: { ...themes[defaultTheme]?.partials },
    helpers: { ...themes[defaultTheme]?.helpers },
    properties: { ...defaultProperties },
  };


  // Add partials and helpers from all themes, prefixed with the theme name.
  for (const [themeName, theme] of Object.entries(themes)) {
    const addPrefix = (k: string) => `${themeName}/${k}`;
    Object.assign(templates.partials, mapKeys(theme.partials, addPrefix));
    Object.assign(templates.helpers, mapKeys(theme.helpers, addPrefix));
  }

  return templates;
}

/**
 * Read templates and helpers from a directory.
 */
export async function readTemplates(): Promise<Required<Templates>> {
  return {
    partials: await readPartials(),
    helpers: await readHelpers('helpers'),
    properties: await readHelpers('properties'),
  };
}

async function readPartials() {
  const partials: NonNullable<Templates['partials']> = {};
  const partialNames = ["common", "contract", "enum", "error", "event", "function", "modifier", "page", "struct", "variable", "user-defined-value-type"]
  for (const name of partialNames) {
    const p = await import('raw-loader!./themes/markdown/' + name + '.hbs')
    partials[name] = () => p.default
  }
  return partials;
}

async function readHelpers(name: string) {
  let helpersPath;
  
  const h = await import('./themes/markdown/helpers');
  const helpers: Record<string, (...args: any[]) => any> = {};

  for (const name in h) {
    if (typeof h[name] === 'function') {
      helpers[name] = h[name];
    }
  }
  
  return helpers;
}

/**
 * Reads all built-in themes into an object. Partials will always be found in
 * src/themes, whereas helpers may instead be found in dist/themes if TypeScript
 * can't be imported directly.
 */
async function readThemes(): Promise<Record<string, Required<Templates>>> {
  const themes: Record<string, Required<Templates>> = {};



  themes['markdown'] = await readTemplates();


  return themes;
}
